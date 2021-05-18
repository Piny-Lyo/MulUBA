import * as d3 from 'd3';
import originData from './data/bar-scatter-single-axis-chart.json';
import { getUserByUserID } from '../store/actions';
import * as d3Fisheye from 'd3-fisheye';

class chart {
    // 画布的宽高
    width = 0;
    height = 0;
    // 外边距
    margin = {
        top: 30,
        left: 160
    };
    // color = d3.scaleOrdinal().domain(['0','1','2','3','4']).range(['#1890FF', '#13C2C2', '#2FC25B', '#FACC14', '#F04864']);
    // color = d3.scaleOrdinal().domain(['0','1','2','3','4']).range(['#2E90D1', '#5ADBDC', '#FDD44A', '#FB8B6B', '#D6479E']);
    color = d3.scaleOrdinal().domain(['1','2','3','4','5']).range(['#2E90D1', '#5ADBDC', '#FDD44A', '#FB8B6B', '#E0AAF0']);
    svg = null;
    // tooltip
    tooltip = null;
    topK = 10;
    // 比例尺
    x = d3.scaleBand().paddingInner(0.6);
    y = d3.scaleBand().paddingInner(0.15);
    barWidthScale = d3.scaleLinear().range([0, 50]);
    circleRadiusScale = d3.scaleSqrt().range([0, 27]);
    // 径向折线图比例尺
    rLineX = d3.scaleBand()
    .domain(d3.range(this.topK))
    .range([0, 2 * Math.PI]);
    rLineYObj = {};
    rLine = d3.lineRadial()
    .curve(d3.curveLinearClosed)
    .angle((d, i) => this.rLineX(i));
    fisheye = d3Fisheye.radial()
        .radius(40)
        .distortion(5)
        .smoothing(0.5);
    isZoom = false;

    // 初始化
    init(container, comparValObj, dispatch) {
        let data = JSON.parse(JSON.stringify(originData));

        this.width = container.clientWidth;
        this.height = container.clientHeight;
        
        this.svg = d3.select(container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.zoomCircle = this.svg.append('circle')
        .attr('class', 'zoom-circle')
        .attr('r', 40)
        .attr('fill', '#000')
        .attr('opacity', 0);
    
        this.tooltip = d3.select('.view-a .tooltip');

        // 每行group的g元素
        this.groupG = this.svg.append('g');

        this.x.domain(data.columns.behaviorTypes).range([0, this.width - this.margin.left]);
        this.y.domain(d3.range(data.userStatics.length)).range([0, this.height - this.margin.top]);
        let usersArr = [];
        for (let el of data.userStatics) {
            usersArr = usersArr.concat(el.users);
        }
        this.barWidthScale.domain([0, d3.max(usersArr)]);

        // behavior column text g
        let behaviorGJoin = this.svg.append('g').selectAll('g').data(data.columns.behaviorTypes);
        behaviorGJoin.exit().remove();
        let behaviorGEnter = behaviorGJoin.enter().append('g')
        .merge(behaviorGJoin)
        .attr('transform', (d, i) => `translate(${this.margin.left + this.x(d)}, 10)`);

        // behavior column text
        behaviorGEnter.selectAll('text').data(d => [d])
        .join('text')
        .attr('font-size', '14px')
        .attr('text-anchor', 'middle')
        .attr('fill', '#2F4F4F')
        .text(d => d);

        // group g
        let groupGJoin = this.groupG.selectAll('.group-row').data(data.userStatics);
        groupGJoin.exit().remove();
        let groupGEnter = groupGJoin.enter().append('g')
        .attr('class', 'group-row')
        .merge(groupGJoin)
        .attr('transform', (d, i) => `translate(${this.margin.left}, ${this.margin.top + 20 + this.y(i)})`);

        // 行为column文字
        groupGEnter.selectAll('text').data(d => d.clusterType)
        .join('text')
        .attr('font-size', '16px')
        .attr('dx', -this.margin.left)
        // 偏移让字的垂直中心对在右边的线上
        .attr('dy', '5px')
        .text(d => `G${d}`)
        .attr('cursor', 'default')

        // 画线
        groupGEnter.selectAll('line').data(data.columns.behaviorTypes)
        .join('line')
        .attr('stroke', '#D0D0D0')
        .attr('stroke-width', 1)
        .attr('x1', (d, i) => {
            // 为了让线可以连接到左侧嵌套柱图
            if (i === 0) {
                return -100;
            }
            return this.x(d);
        })
        .attr('x2', (d, i) => this.x(data.columns.behaviorTypes[i+1]));

        const barColors = ['#888', '#bbb', '#eee'];
        // 画柱图
        groupGEnter.selectAll('.rect-g').data((d, i) => {
            const users = [];
            d.users.reverse().forEach(el => users.push({
                'row': i,
                'data': el
            }))
            return [users];
        })
        .join('g')
        .attr('class', 'rect-g')
        .on('mouseenter', (d, i) => {
            this.tooltip.style('visibility', 'visible');
            let formatD = [];
            d.forEach(el => {
                formatD.push(d3.format('~s')(el.data));
            })
            let tooltipStr = `CU: ${formatD[2]}, GU: ${formatD[1]}, PU: ${formatD[0]}`;
            this.tooltip.html(tooltipStr);
            this.tooltip.style('left', (d3.event.pageX + 10) + 'px');
            this.tooltip.style('top', (d3.event.pageY - 10) + 'px');
        })
        .on('mouseleave', d => {
            this.tooltip.style('visibility', 'hidden');
        })
        .selectAll('rect').data(d => d)
        .join('rect')
        .attr('x', d => 35 - this.margin.left)
        .attr('y', (d, i) => -(this.y.bandwidth() / (i + 1)) / 4)
        .attr('width', d => this.barWidthScale(d.data))
        .attr('height', (d, i) => (this.y.bandwidth() / (i + 1)) / 2)
        .attr('fill', (d, i) => i === 0 ? null : barColors[i]);

        this.update(comparValObj, dispatch);
    }
    
    // 更新数据，重绘视图
    update(comparValObj, dispatch) {
        let data = JSON.parse(JSON.stringify(originData));

        // behaviors数据汇总数组，topK用户data汇总数组，按类型分类behaviors数组（相当于原本behaviors的纵向排列）
        let behaviorsArr = [], topKUsersArr = [], behaviorTypeArr = [];
        for (let el of data.userStatics) {
            // 如果进行了单选，且需要计算平均数
            if (comparValObj.sta === 'ave') {
                el.behaviors = el.behaviors.map(behavior => behavior / el.users[1]);
            }
            behaviorsArr = behaviorsArr.concat(el.behaviors);
            // 如果选择分行为比较
            for (let i in data.columns.behaviorTypes) {
                i = ~~i;
                topKUsersArr[i] = Array.isArray(topKUsersArr[i]) ? topKUsersArr[i] : [];
                topKUsersArr[i] = topKUsersArr[i].concat(el.topKUsers[i].map(el => el.value));
                behaviorTypeArr[i] = Array.isArray(behaviorTypeArr[i]) ? behaviorTypeArr[i] : [];
                behaviorTypeArr[i] = behaviorTypeArr[i].concat(el.behaviors[i]);
            }
        }
        // 选择分行为比较时，使用circleRadiusScaleArr，纵向比较
        let circleRadiusScaleArr = [];
        behaviorTypeArr.forEach((el, i) => {
            const tempCircleRadiusScale = d3.scaleSqrt().domain([0, d3.max(el)]).range([0, 27]);
            circleRadiusScaleArr.push(tempCircleRadiusScale);
        });
        // 选择全部行为比较时，横纵皆可比较
        this.circleRadiusScale.domain([0, d3.max(behaviorsArr)]);
        // 如果选择分行为比较
        topKUsersArr.forEach((el, i) => {
            const rLineY = d3.scaleLinear();
            rLineY.domain(d3.extent(topKUsersArr[i]))
            .range([circleRadiusScaleArr[i](d3.max(behaviorTypeArr[i])), circleRadiusScaleArr[i](d3.max(behaviorTypeArr[i])) + 10]);
            this.rLineYObj[data.columns.behaviorTypes[i]] = rLineY;
        });
        
        // group g，一行对应一个group
        let groupGJoin = this.groupG.selectAll('.group-row').data(data.userStatics);
        groupGJoin.exit().remove();
        let groupGEnter = groupGJoin.enter().append('g')
        .attr('class', 'group-row')
        .merge(groupGJoin)
        .attr('fill', (d, i) => this.color(data.columns.behaviorTypes[i]))
        .attr('transform', (d, i) => `translate(${this.margin.left}, ${this.margin.top + 20 + this.y(i)})`);

        // 更新，行为column文字对应的tooltip data
        groupGEnter.selectAll('text')
        .on('mouseenter', d => {
            this.tooltip.style('visibility', 'visible');
            const i = Number(d)-1;
            let users = [];
            data.userStatics[i].users.forEach(el => {
                users.push(d3.format('~s')(el));
            })
            let behaviors = [];
            data.userStatics[i].behaviors.forEach(el => {
                if (comparValObj.sta === 'ave') {
                    behaviors.push(d3.format('.2f')(el));
                } else {
                    behaviors.push(d3.format('~s')(el));
                }
            })
            let tooltipStr = `CU: ${users[0]}, GU: ${users[1]}, PU: ${users[2]}
            <br>pv: ${behaviors[0]}, cart: ${behaviors[1]}, fav: ${behaviors[2]}, buy: ${behaviors[3]}, clk: ${behaviors[4]}`;
            this.tooltip.html(tooltipStr);
            this.tooltip.style('left', (d3.event.pageX + 10) + 'px');
            this.tooltip.style('top', (d3.event.pageY - 10) + 'px');
        })
        .on('mouseleave', d => {
            this.tooltip.style('visibility', 'hidden');
        });
        
        // 画圆，group的行为数
        groupGEnter.selectAll('.group-cricle').data((d, i) => {
            const behaviors = [];
            d.behaviors.forEach(el => behaviors.push({
                'row': i,
                'data': el
            }));
            return behaviors;
        })
        .join(
            enter => enter.append('circle').attr('class', 'group-cricle')
            )
        .attr('cx', (d, i) => this.x(data.columns.behaviorTypes[i]))
        // 根据横纵比较和纵向比较的需要，给予不同的圆比例尺计算
        .attr('r', (d, i) => {
            return (comparValObj.compar === 'respectively') ? circleRadiusScaleArr[i](d.data) : this.circleRadiusScale(d.data)})
        .on('mouseenter', (d, i) => {
            this.tooltip.style('visibility', 'visible');
            let tooltipStr = comparValObj.sta === 'ave' ? `value: ${d3.format('.2f')(d.data)}` : `value: ${d3.format('~s')(d.data)}`;
            this.tooltip.html(tooltipStr);
            this.tooltip.style("left", (d3.event.pageX + 10) + "px");
            this.tooltip.style("top", (d3.event.pageY - 10) + "px");
        })
        .on('mouseleave', d => {
            this.tooltip.style('visibility', 'hidden');
        });

        // 查看所有行为，先删除径向折线图
        if (comparValObj.compar === 'all') {
            groupGEnter.selectAll('.r-line-g').remove();
        }
        
        // 画径向折线图
        const rLineG = groupGEnter.selectAll('.r-line-g').data(d => d.topKUsers.map((el, i) => 
        el.map(element =>
            Object.assign({'behavior': data.columns.behaviorTypes[i]}, {data: element}))))
        .join('g')
        .attr('class', 'r-line-g')
        .attr('transform', (d, i) => `translate(${this.x(data.columns.behaviorTypes[i])}, 0)`);
        
        if (comparValObj.compar === 'respectively') {
            rLineG.selectAll('path').data(d => [d]).join('path')
            .attr('fill', 'none')
            .attr('stroke', '#A0A0A0')
            .attr('stroke-width', 1.5)
            .attr('d', this.rLine.radius(d => this.rLineYObj[d.behavior](d.data.value)));
            
            // 在折线上打点
            rLineG.selectAll('circle').data(d => d)
            .join('circle')
            // .attr('fill', 'red')
            .attr('cx', (d, i) => d3.pointRadial(this.rLineX(i), this.rLineYObj[d.behavior](d.data.value))[0])
            .attr('cy', (d, i) => d3.pointRadial(this.rLineX(i), this.rLineYObj[d.behavior](d.data.value))[1])
            .attr('r', 3)
            // .append('title')
            // .text(d => `${d.userID}\n${d.data.toLocaleString('zh', {hour12: false})}`)
            .on('mouseenter', d => {
                this.tooltip.style('visibility', 'visible');
                let tooltipStr = `user id: ${d.data.userID}<br>value: ${d.data.value}`;
                this.tooltip.html(tooltipStr);
                this.tooltip.style('left', (d3.event.pageX + 10) + 'px');
                this.tooltip.style('top', (d3.event.pageY - 10) + 'px');
            })
            .on('mouseleave', d => {
                this.tooltip.style('visibility', 'hidden');
            })
            .attr('cursor', 'pointer')
            .on('click', d => {
                dispatch(getUserByUserID(d.data.userID));
                rLineG.selectAll('circle')
                .filter(p => p.data.userID === d.data.userID)
                .attr('fill', '#F04864');
            })
        }

        const that = this;
        this.svg
        .on('mousemove', function() {
            if (that.isZoom) {
                that.fisheye.focus(d3.mouse(this));

                that.zoomCircle
                .attr('cx', d3.mouse(this)[0])
                .attr('cy', d3.mouse(this)[1]);
                
                d3.selectAll('.rect-g').selectAll('rect')
                .each((d, i) => {
                    d.fisheye = that.fisheye([35, that.margin.top + 20 + that.y(d.row) - (that.y.bandwidth() / (i + 1)) / 4]);
                })
                // .attr('x', d => d.fisheye[0] - that.margin.left)
                // .attr('y', (d, i) => d.fisheye[1] - (that.margin.top + 20 + that.y(d.row)))
                .attr('width', (d, i) => {
                    if (d.fisheye[2] === 1) {
                        return that.barWidthScale(d.data);
                    } else {
                        return d.fisheye[2] * that.barWidthScale(d.data);
                    }
                })
                .attr('height', (d, i) => {
                    if (d.fisheye[2] === 1) {
                        return (that.y.bandwidth() / (i + 1)) / 2;
                    } else {
                        return d.fisheye[2] * ((that.y.bandwidth() / (i + 1)) / 2);
                    }
                })
                
                groupGEnter.selectAll('.group-cricle')
                .each((d, i) => {
                    d.fisheye = that.fisheye([that.x(data.columns.behaviorTypes[i]) + that.margin.left, that.margin.top + 20 + that.y(d.row)]);
                })
                // .attr('cx', (d, i) => d.fisheye[0] - that.margin.left)
                // .attr('cy', (d, i) => {
                //     return d.fisheye[1] - (that.margin.left, that.margin.top + 20 + that.y(d.row));
                // })
                // 根据横纵比较和纵向比较的需要，给予不同的圆比例尺计算
                .attr('r', (d, i) => {
                    const radius = comparValObj.compar === 'respectively' ? circleRadiusScaleArr[i](d.data) : that.circleRadiusScale(d.data)
                    if (d.fisheye[2] === 1) {
                        return radius;
                    } else {
                        return d.fisheye[2] * radius;
                    }
                });
            }
        })
    }

    // 开关放大交互
    zoomSwitchChange(checked) {
        this.isZoom = checked;
        if (this.isZoom) {
            this.zoomCircle
            .attr('r', 40)
            .attr('fill', '#000')
            .attr('opacity', 0.1);
        } else {
            this.zoomCircle
            .attr('r', 40)
            .attr('fill', '#000')
            .attr('opacity', 0);
        }
    }
    
};

export default new chart();