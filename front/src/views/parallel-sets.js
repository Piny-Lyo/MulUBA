import * as d3 from 'd3';
import { sankey as d3Sankey, sankeyLinkHorizontal as d3SsankeyLinkHorizontal } from 'd3-sankey';
import data from './data/parallel-sets.json';
import _ from 'lodash';

class chart {
    // 画布的宽高
    width = 0;
    height = 0;
    // color = d3.scaleOrdinal().domain(['0','1','2','3','4']).range(['#1890FF', '#13C2C2', '#2FC25B', '#FACC14', '#F04864']);
    color = d3.scaleOrdinal().domain(["1","2","3","4","5"]).range(['#2E90D1', '#5ADBDC', '#FDD44A', '#FB8B6B', '#E0AAF0']);
    // tooltip
    tooltip = null;
    
    // 初始化
    init(container) {
        this.width = container.clientWidth;
        this.height = container.clientHeight;

        this.tooltip = d3.select('.view-b .tooltip');
        
        this.svg = d3.select(container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.sankey = d3Sankey()
        .nodeSort(null)
        .linkSort(null)
        .nodeWidth(4)
        .nodePadding(20)
        .extent([[0, 5], [this.width, this.height - 5]]);

        this.update();
        
    }

    update() {
        this.data = _.cloneDeep(data);
        this.nodeObj = this.data.nodeObj;
        this.paraSetsData = this.data.parallelSets;

        this.graphConstructor();

        const {nodes, links} = this.sankey({
            nodes: this.graph.nodes.map(d => Object.assign({}, d)),
            links: this.graph.links.map(d => Object.assign({}, d))
        });

        this.maxMap = new Map();
        let lastLinkArr = [];
        // if (topKChecked !== null && topKChecked) {
            // 倒序遍历links
            for (let i = links.length - 1; i >= 0; i--) {
                const el = links[i];
                if (el.names.length === 7) {
                    lastLinkArr.push(el);
                }
            }
            lastLinkArr.sort((a, b) => b.value - a.value);
            // 存储每个分类下value最大的link，主要用于颜色编码
            for (let i = 0; i < lastLinkArr.length; i++) {
                const el = lastLinkArr[i];
                // 初始化maxMap，key为每个group
                if (!this.maxMap.has(el.names[0])) {
                    this.maxMap.set(el.names[0], []);
                }
                this.maxMap.get(el.names[0]).push(el);
            }
        // }

        this.rectG = this.svg.append('g');
        this.rectG.selectAll('rect').data(nodes)
        .join('rect')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('height', d => d.y1 - d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('fill', '#2F4F4F')
        .on('mouseenter', d => {
            this.tooltip.style('visibility', 'visible');
            let tooltipStr = `${d.name} ${d.value.toLocaleString()}`;
            if (d.name === 'G1' || d.name === 'G2' || d.name === 'G3' || d.name === 'G4' || d.name === 'G5') {
                tooltipStr += `<br>Subgroup Total: ${this.maxMap.get(d.name).length}`;
            }
            this.tooltip.html(tooltipStr);
            this.tooltip.style("left", (d3.event.pageX + 10) + "px");
            this.tooltip.style("top", (d3.event.pageY - 10) + "px");
        })
        .on('mouseleave', d => {
            this.tooltip.style('visibility', 'hidden');
        });

        this.linkG =  this.svg.append('g')
        .attr('fill', 'none');
        this.linkG.selectAll('path').data(links)
        .join('path')
        .attr('d', d3SsankeyLinkHorizontal())
        .attr('stroke', d => this.color(d.names[0]))
        .attr('stroke-width', d => d.width)
        .style('mix-blend-mode', 'multiply')
        .on('mouseenter', d => {
            this.tooltip.style('visibility', 'visible');
            let tooltipStr = `${d.names.join(' → ')}<br>${d.value.toLocaleString()}`;
            this.tooltip.html(tooltipStr);
            this.tooltip.style("left", (d3.event.pageX + 10) + "px");
            this.tooltip.style("top", (d3.event.pageY - 10) + "px");
        })
        .on('mouseleave', d => {
            this.tooltip.style('visibility', 'hidden');
        });
        // .append('title')
        // .text(d => `${d.names.join(' → ')}\n${d.value.toLocaleString('zh', {hour12: false})}`);

        this.textG = this.svg.append('g').style('font', '10px sans-serif');
        this.textG.selectAll('text').data(nodes)
        .join('text')
        .attr('x', d => d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr('y', d => (d.y1 + d.y0) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', d => d.x0 < this.width / 2 ? 'start' : 'end')
        .text(d => d.name)
        .append('tspan')
        .attr('fill', '#2F4F4F')
        .attr('fill-opacity', 0.9)
        .text(d => ` ${d3.format('.2s')(d.value)}`);
    }
    
    // 更新数据，重绘视图
    filter(groups, topKChecked) {
        groups.sort();
        if (groups.length <= 0) {
            this.rectG.selectAll('rect').data(groups)
            .join('rect');
            this.linkG.selectAll('path').data(groups)
            .join('path');
            this.textG.selectAll('text').data(groups)
            .join('text');
            return;
        }
        this.nodeObj.clusterType = groups;
        this.paraSetsData = this.data.parallelSets.filter(el => groups.indexOf(el.clusterType) !== -1);

        this.graphConstructor();

        const {nodes, links} = this.sankey({
            nodes: this.graph.nodes.map(d => Object.assign({}, d)),
            links: this.graph.links.map(d => Object.assign({}, d))
        });

        this.rectG.selectAll('rect').data(nodes)
        .join(
            enter => enter.append('rect'),
            update => {
                update.select('title').remove();
                return update;
            },
            exit => exit.remove()
        )
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('height', d => d.y1 - d.y0)
        .attr('width', d => d.x1 - d.x0)
        // .on('mouseenter', d => {
        //     this.tooltip.style('visibility', 'visible');
        //     let tooltipStr = `${d.name} ${d.value.toLocaleString()}`;
        //     // 
        //     this.tooltip.html(tooltipStr);
        //     this.tooltip.style("left", (d3.event.pageX + 10) + "px");
        //     this.tooltip.style("top", (d3.event.pageY - 10) + "px");
        // })
        // .on('mouseleave', d => {
        //     this.tooltip.style('visibility', 'hidden');
        // });

        // if (topKChecked !== null && topKChecked) {
        //     // 存储每个分类下value最大的link，主要用于颜色编码
        //     // 倒序遍历links
        //     for (let i = links.length - 1; i >= 0; i--) {
        //         const el = links[i];
        //         // 初始化maxMap，key为每个group
        //         if (!maxMap.has(el.names[0])) {
        //             maxMap.set(el.names[0], new Map());
        //         }
        //         // 每个group下包含不同的两两分类属性之间的link，存储两两分类属性之间link的value最大的那一个
        //         if (!maxMap.get(el.names[0]).has(el.names.length)) {
        //             maxMap.get(el.names[0]).set(el.names.length, el);
        //         }
        //         // 不断用更大的value替代原本的值，但是要保证所有最大值都是属于分类最细且value最大的names的子集
        //         // （也就是说，先找到每个group最后一层value最大的link，然后倒回去把前面层跟该link同属相同子names的link找出来，这也是links倒序遍历的原因）
        //         if (el.value >= maxMap.get(el.names[0]).get(el.names.length).value) {
        //             // if (el.names.length === links[links.length-1].names.length) {
        //             maxMap.get(el.names[0]).set(el.names.length, el);
        //             // } else {
        //             //     if (maxMap.get(el.names[0]).get(links[links.length-1].names.length).names.toString().indexOf(el.names.toString()) === 0) {
        //             //         maxMap.get(el.names[0]).set(el.names.length, el);
        //             //     }
        //             // }
        //         }
        //     }
        // }

        this.linkG.selectAll('path').data(links)
        .join(
            enter => enter.append('path'),
            update => {
                update.select('title').remove();
                return update;
            },
            exit => exit.remove()
        )
        .attr('d', d3SsankeyLinkHorizontal())
        .attr('stroke', d => this.color(d.names[0]))
        .attr('stroke-width', d => d.width)
        .attr('opacity', d => {
            if (topKChecked !== null && topKChecked) {
                const dNamesStr = d.names.toString();
                let isOpacity = false;
                for (let i = 0; i < 3; i++) {
                    let maxMapStr = this.maxMap.get(d.names[0])[i].names.toString();
                    isOpacity = isOpacity || (maxMapStr.indexOf(dNamesStr) !== -1);
                }
                return isOpacity ? 1 : 0.3;
            } else {
                return 1;
            }
        })
        .style('mix-blend-mode', 'multiply')
        .on('mouseenter', d => {
            this.tooltip.style('visibility', 'visible');
            let tooltipStr = `${d.names.join(' → ')}<br>${d.value.toLocaleString()}`;
            this.tooltip.html(tooltipStr);
            this.tooltip.style("left", (d3.event.pageX + 10) + "px");
            this.tooltip.style("top", (d3.event.pageY - 10) + "px");
        })
        .on('mouseleave', d => {
            this.tooltip.style('visibility', 'hidden');
        });
        // .append('title')
        // .text(d => `${d.names.join(' → ')}\n${d.value.toLocaleString('zh', {hour12: false})}`);

        this.textG.selectAll('text').data(nodes)
        .join(
            enter => enter.append('text'),
            update => {
                update.select('tspan').remove();
                return update;
            },
            exit => exit.remove()
        )
        .attr('x', d => d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr('y', d => (d.y1 + d.y0) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', d => d.x0 < this.width / 2 ? 'start' : 'end')
        .text(d => d.name)
        .append('tspan')
        .attr('fill', '#2F4F4F')
        .attr('fill-opacity', 0.9)
        .text(d => ` ${d3.format('.2s')(d.value)}`);
    }

    graphConstructor() {
        const keys = Object.keys(this.paraSetsData[0]).slice(0, -1);
        this.graph = (() => {
            let index = -1;
            const nodes = [];
            // const nodeByKey = new Map();
            const indexByKey = new Map();
            const links = [];
            
            // 对数据进行重排序（类似Excel多列排序），使数据有序，避免视觉混淆
            this.paraSetsData.sort((a, b) => {
                for (const key of Object.keys(this.paraSetsData[0]).slice()) {
                    if (a[key] !== b[key]) {
                        if (key === 'value') {
                            return a[key] - b[key];
                        }
                        return a[key].localeCompare(b[key]);
                    }
                }
                return 0;
            });
            
            // 原版nodes构造过程
            // for (const k of keys) {
            //     for (const d of this.paraSetsData) {
            //         const key = JSON.stringify([k, d[k]]);
            //         if (nodeByKey.has(key)) continue;
            //         const node = {name: d[k]};
            //         nodes.push(node);
            //         nodeByKey.set(key, node);
            //         indexByKey.set(key, ++index);
            //     }
            // }
            
            // 新版nodes构造
            // 新方法可以保证按照用户自己想要的形式构造nodes
            for (const key in this.nodeObj) {
                for (const el of this.nodeObj[key]) {
                    const keyStr = JSON.stringify([key, el]);
                    const node = {name: el};
                    nodes.push(node);
                    indexByKey.set(keyStr, ++index);
                }
            }
            
            for (let i = 1; i < keys.length; i++) {
                const a = keys[i - 1];
                const b = keys[i];
                const prefix = keys.slice(0, i + 1);
                const linkByKey = new Map();
                for (const d of this.paraSetsData) {
                    const names = prefix.map(k => d[k]);
                    const key = JSON.stringify(names);
                    const value = +d.value || 1;
                    let link = linkByKey.get(key);
                    if (link) { link.value += value; continue; }
                    link = {
                        source: indexByKey.get(JSON.stringify([a, d[a]])),
                        target: indexByKey.get(JSON.stringify([b, d[b]])),
                        names,
                        value
                    };
                    links.push(link);
                    linkByKey.set(key, link);
                }
            }
            return {nodes, links};
        })();
    }
    
};

export default new chart();