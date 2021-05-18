import * as d3 from 'd3';
// import { getUserBehaviorsOfMinByTime, getMinUserBehaviorsByTime } from "../store/actions";
import { getUserBehaviorsOfMinByTime } from "../store/actions";

class chart {
    // 画布的宽高
    width = 0;
    height = 0;
    // 外边距
    margin = {
        top: 10,
        left: 150
    };
    // color = d3.scaleOrdinal().domain(["0","1","2","3","4"]).range(['#1890FF', '#13C2C2', '#2FC25B', '#FACC14', '#F04864']);
    color = d3.scaleOrdinal().domain(["0","1","2","3","4"]).range(['#2E90D1', '#5ADBDC', '#FDD44A', '#FB8B6B', '#E0AAF0']);
    svg = null;
    hours = d3.range(24);
    mins = d3.range(60);
    // 分钟面积图高度
    minHeight = 50;
    // 比例尺
    xTop = d3.scaleBand().domain(this.hours);
    // yTop = d3.scaleBand().paddingInner(0.1);
    // 全部分钟面积图x比例尺
    allMinX = d3.scaleBand().domain(this.mins);
    // 刷选后的部分分钟面积图x比例尺
    partMinX = d3.scaleBand().domain(this.mins);
    // 用于刷选的线性分钟面积图比例尺
    linearMinX = d3.scaleLinear().domain(d3.extent(this.mins));
    // 分钟面积图y比例尺
    minY = d3.scaleLinear().domain([0, 50]).range([this.minHeight, 0]);
    // 行为图y比例尺
    behaviorChartY = d3.scaleLinear();
    // d3形状生成器
    symbolGenerator = d3.symbol().size(100);
    // 形状和行为映射字典
    symbolBehaviorDic = {
        'pv': 'symbolTriangle',
        'cart': 'symbolSquare',
        'fav': 'symbolCircle',
        'buy': 'symbolCross',
        'clk': 'symbolStar'
    };
    // tooltip
    tooltip = null;
    highlightD = null;

    // 初始化
    init(container) {
        this.width = container.clientWidth;
        this.height = container.clientHeight;

        this.tooltip = d3.select('.view-e .tooltip');
        
        this.svg = d3.select(container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.xTop.range([0, this.width - this.margin.left]);
        // 全部分钟面积图x比例尺
        this.allMinX.range([0, this.width - this.margin.left]);
        // 刷选后的部分分钟面积图x比例尺
        this.partMinX.range([0, this.width - this.margin.left]);
        // 用于刷选的线性分钟面积图比例尺
        this.linearMinX.range([0, this.width - this.margin.left]);
        const behaviorChartHeight = this.height - this.margin.top - (this.xTop.bandwidth()/2)*3 - (this.minHeight+10)*2;
        // 行为图y比例尺
        // 总高度height - margin.top高度 - 上半部分小时时间轴高度(this.xTop.bandwidth()/2)*3 - 下半部分分钟时间轴高度(this.minHeight+10)*2
        this.behaviorChartY.range([30, behaviorChartHeight - 10]);
        // 轴
        const allMinXBottomAxis = d3.axisBottom(this.allMinX);

        // 图例
        const legendG = this.svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(40, ${this.margin.top + (this.xTop.bandwidth()/2)*3})`);

        const legendRowG = legendG.selectAll('g').data(Object.keys(this.symbolBehaviorDic))
        .join('g')
        .attr('class', 'legend-row')
        .attr('transform', (d, i) => `translate(0, ${i * 50})`);

        legendRowG.selectAll('text').data(d => [d])
        .join('text')
        .attr('font-size', 12)
        .attr('text-anchor', 'middle')
        .text(d => d);

        legendRowG.selectAll('path').data(d => [d])
        .join('path')
        .attr('transform', 'translate(50, -4)')
        .attr('fill', '#2F4F4F')
        .attr('d', d => {
            this.symbolGenerator.type(d3[this.symbolBehaviorDic[d]]);
            return this.symbolGenerator();
        })

        // 小时时间轴
        const hoursTimeAxisG = this.svg.append('g')
        .attr('class', 'hours-time-axis')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
        // 小时时间轴上部分
        this.hoursTimeAxisWeekG = hoursTimeAxisG.append('g')
        .attr('class', 'hours-time-axis-week')
        
        // 小时时间轴中间部分
        this.hoursTimeAxisCenterG = hoursTimeAxisG.append('g')
        .attr('class', 'hours-time-axis-center')
        .attr('transform', `translate(0, ${this.xTop.bandwidth()/2})`);
        this.hoursTimeAxisCenterG.selectAll('rect').data(this.hours)
        .join('rect')
        .attr('x', d => this.xTop(d))
        .attr('width', this.xTop.bandwidth())
        .attr('height', this.xTop.bandwidth()/2)
        .attr('stroke', '#F0F0F0')
        .attr('fill', '#F0F0F0');
        this.hoursTimeAxisCenterG.selectAll('text').data(this.hours)
        .join('text')
        .attr('font-size', 12)
        .attr('dx', d => this.xTop(d) + this.xTop.bandwidth() / 2)
        .attr('dy', d => this.xTop.bandwidth() / 4  + 14/3)
        .attr('text-anchor', 'middle')
        .text(d => d)
        .attr('fill', '#2F4F4F');
        // 小时时间轴下部分
        this.hoursTimeAxisDayG = hoursTimeAxisG.append('g')
        .attr('class', 'hours-time-axis-day')
        .attr('transform', `translate(0, ${this.xTop.bandwidth()})`);

        const minTimeAxisG = this.svg.append('g')
        .attr('class', 'min-time-axis')
        .attr('transform', `translate(${this.margin.left}, ${this.height - 70})`);

        this.allMinTimeAxisG = minTimeAxisG.append('g')
        .attr('class', 'all-min-time-axis');

        this.allMinArea = d3.area()
        .curve(d3.curveMonotoneX)
        .x((d, i) => this.allMinX(i))
        .y0(this.minHeight)
        .y1(d => this.minY(d));

        this.allMinTimeAxisG.append('g')
        .attr('class', 'axis axis-x-all')
        .attr('transform', `translate(0, ${this.minHeight})`)
        .call(allMinXBottomAxis);

        this.allMinTimeAxisBrushG = this.allMinTimeAxisG.append('g')
        .attr('class', 'brush');

        const partMinTimeAxisG = minTimeAxisG.append('g')
        .attr('class', 'part-min-time-axis')
        .attr('transform', `translate(0, -10)`);
        this.partMinTimeAxisRect = partMinTimeAxisG.append('rect')
        .attr('transform', `translate(0, -12)`)
        .attr('width', this.partMinX.range()[1])
        .attr('height', 17)
        .attr('fill', '#F0F0F0');

        this.partMinXBottomAxisG =  partMinTimeAxisG.append('g')
        .attr('class', 'axis-x-part');

        // 行为图的g元素
        const behaviorChartG = this.svg.append('g')
        .attr('class', 'behavior-chart')
        .attr('transform', `translate(${this.margin.left+8}, ${this.margin.top + (this.xTop.bandwidth()/2)*3})`);

        d3.selectAll('.behavior-chart')
        .append('rect')
        .attr('class', 'clk-rect')
        .attr('width', this.width - this.margin.left)
        .attr('height', behaviorChartHeight)
        .attr('fill', '#FCFCFC')
        .on('click', () => {
            this.highlightD = null;
            this.highlight(false);
        });

        this.behaviorLineG = behaviorChartG.append('g');
        this.behaviorSymbolG = behaviorChartG.append('g');

        // 热力图配色
        this.weekHeatColor = d3.scaleSequential(d3.interpolateReds).domain([0, 100]);
        this.dayHeatColor = d3.scaleSequential(d3.interpolateOranges).domain([0, 100]);
    }
    
    // 更新上半部分小时时间轴
    updateHour(userID, dayTime, hourBehaviors, dispatch) {
        const hourBehaviorOfWeek = hourBehaviors.hourBehaviorOfWeek.slice();
        const hourBehaviorOfDay = hourBehaviors.hourBehaviorOfDay.slice();

        // 将点击数据转换到同一个数组中，便于绘制纹理点
        let hourClkOfWeekArr = [];
        let hourClkOfDayArr = [];
        hourBehaviors.hourClkOfWeek.slice().forEach((el, i) => {
            let num = Number(el);
            for (let j = 0; j < Number(el); j++) {
                hourClkOfWeekArr.push({
                    'hour': i,
                    'data': num--
                })
            }
        });
        hourBehaviors.hourClkOfDay.slice().forEach((el, i) => {
            let num = Number(el);
            for (let j = 0; j < Number(el); j++) {
                hourClkOfDayArr.push({
                    'hour': i,
                    'data': num--
                })
            }
        });

        this.weekHeatColor.domain(d3.extent(hourBehaviorOfWeek));
        this.dayHeatColor.domain(d3.extent(hourBehaviorOfWeek));

        this.hoursTimeAxisWeekG.selectAll('rect').data(hourBehaviorOfWeek)
        .join('rect')
        .attr('x', (d, i) => this.xTop(i))
        .attr('width', this.xTop.bandwidth())
        .attr('height', this.xTop.bandwidth()/2)
        .attr('stroke', '#F0F0F0')
        .attr('fill', d => this.weekHeatColor(d));
        
        this.hoursTimeAxisWeekG.selectAll('circle').data(hourClkOfWeekArr)
        .join('circle')
        .attr('cx', (d, i) => this.xTop(d.hour) + 5 + 5*d.data)
        .attr('cy', d => 5)
        .attr('r', (d, i) => d.data !== 0 ? 2 : 0)
        .attr('fill', '#FFF');

        this.hoursTimeAxisCenterG.selectAll('rect')
        .attr("cursor", "pointer")
        .on('click', (d, i) => {
            dispatch(getUserBehaviorsOfMinByTime({
                'userID': userID,
                'time': new Date(dayTime).setHours(i)
            }));
            // dispatch(getMinUserBehaviorsByTime({
            //     'userID': userID,
            //     'time': new Date(dayTime).setHours(i)
            // }));
            this.hoursTimeAxisCenterG.selectAll('rect')
            .attr('fill', '#F0F0F0')
            .filter((p, j) => j === i)
            .attr('fill', '#F04864')
        });

        this.hoursTimeAxisDayG.selectAll('rect').data(hourBehaviorOfDay)
        .join('rect')
        .attr('x', (d, i) => this.xTop(i))
        .attr('width', this.xTop.bandwidth())
        .attr('height', this.xTop.bandwidth()/2)
        .attr('stroke', '#F0F0F0')
        .attr('fill', d => this.dayHeatColor(d));
        // .attr('opacity', d => (d+1)/4);

        this.hoursTimeAxisDayG.selectAll('circle').data(hourClkOfDayArr)
        .join('circle')
        .attr('cx', (d, i) => this.xTop(d.hour) + 5 + 5*d.data)
        .attr('cy', d => 5)
        .attr('r', (d, i) => d.data !== 0 ? 2 : 0)
        .attr('fill', '#FFF');
    }

    // 更新下半部分分钟时间轴
    updateMin(userID, dayTime, minBehaviorsOfHour, userMinBehaviors, dispatch) {
        this.highlight(false);

        // 分钟行为字典
        this.minBehaviorsDic = {};
        let maxBehaviorNum = 0;
        // 时间转换可以写成utils
        userMinBehaviors.forEach(el => {
            const min =  new Date(Number(el.time)).getMinutes();
            if (this.minBehaviorsDic.hasOwnProperty(min)) {
                this.minBehaviorsDic[min].push(el);
                maxBehaviorNum = this.minBehaviorsDic[min].length > maxBehaviorNum ? this.minBehaviorsDic[min].length : maxBehaviorNum;
            } else {
                this.minBehaviorsDic[min] = [el];
                maxBehaviorNum = this.minBehaviorsDic[min].length > maxBehaviorNum ? this.minBehaviorsDic[min].length : maxBehaviorNum;
            }
        });
        this.newUserMinBehaviors = [];
        this.behaviorChartY.domain([0, maxBehaviorNum-1]);

        const brush = d3.brushX()
        .extent([[0, 0], [this.width - this.margin.left, this.minHeight]])
        .on('brush end', () => this.brushed(userMinBehaviors));

        this.allMinTimeAxisG.selectAll('.all-min-area').data([minBehaviorsOfHour])
        .join('path')
        .attr('class', 'all-min-area')
        .attr('d', this.allMinArea);

        this.allMinTimeAxisBrushG
        .call(brush)
        .call(brush.move, this.allMinX.range());

        // 画行为图的曲线
        this.behaviorLineG.selectAll('.behavior-line').data(userMinBehaviors)
        .join('path')
        .attr('class', 'behavior-line')
        .attr('d', (d, i) => this.behaviorLineConstructor(d, i))
        .attr('stroke', '#ccc')
        .attr('stroke-width', 4)
        .attr('fill', 'none');
        
        // 画行为图的形状
        this.behaviorSymbolG.selectAll('.behavior-symbol').data(userMinBehaviors)
        .join('path')
        .attr('class', 'behavior-symbol')
        .attr('transform', d => {
            const min =  new Date(Number(d.time)).getMinutes();
            return `translate(
            ${this.partMinX(min)}, 
            ${this.behaviorChartY(this.minBehaviorsDic[min].indexOf(d)) !== -1 ? this.behaviorChartY(this.minBehaviorsDic[min].indexOf(d)) : 0}
            )`
        })
        .attr('d', d => {
            this.symbolGenerator.type(d3[this.symbolBehaviorDic[d.behavior]]);
            return this.symbolGenerator();
        })
        .attr('fill', '#F75981')
        .attr('stroke', d3.rgb('#F75981').darker())
        .on('mouseenter', d => {
            this.tooltip.style('visibility', 'visible');
            let tooltipStr = `${new Date(d.time).toLocaleString('zh', {hour12: false})}:
            <br>${d.behavior}, cate ID: ${d.cateID}`;
            this.tooltip.html(tooltipStr);
            this.tooltip.style("left", (d3.event.pageX + 10) + "px");
            this.tooltip.style("top", (d3.event.pageY - 10) + "px");
        })
        .on('mouseleave', d => {
            this.tooltip.style('visibility', 'hidden');
        })
        .on('click', d => {
            this.highlightD = d;
            this.highlight(true, this.highlightD);
        });

    }

    brushed(userMinBehaviors) {
        const sel = d3.event.selection || this.allMinX.range();
        // 向上取整sel选中的定义域
        const xArr = sel.map(this.linearMinX.invert, this.linearMinX);
        // 更新partMinX的定义域
        this.partMinX.domain(d3.range(Math.floor(xArr[0]), Math.ceil(xArr[1]+1)));

        this.partMinTimeAxisRect.attr('fill', '#F0F0F0');
        this.partMinXBottomAxisG.selectAll('text').data(this.partMinX.domain())
        .join('text')
        .attr('x', d => this.partMinX(d)+10)
        .attr('font-size', 12)
        .attr('text-anchor', 'middle')
        .text(d => d);

        this.newUserMinBehaviors = [];
        userMinBehaviors.forEach(el => {
            if (this.partMinX.domain().indexOf(new Date(Number(el.time)).getMinutes()) !== -1) {
                this.newUserMinBehaviors.push(el);
            }
        })
        this.behaviorLineG.selectAll('.behavior-line').data(this.newUserMinBehaviors)
        .join('path')
        .attr('class', 'behavior-line')
        .attr('d', (d, i) => this.behaviorLineConstructor(d, i))
        .attr('stroke', '#ccc')
        .attr('stroke-width', 4)
        .attr('fill', 'none');

        this.behaviorSymbolG.selectAll('.behavior-symbol').data(this.newUserMinBehaviors)
        .join('path')
        .attr('class', 'behavior-symbol')
        .attr('transform', d => {
            const min =  new Date(Number(d.time)).getMinutes();
            return `translate(
            ${this.partMinX(min)}, 
            ${this.behaviorChartY(this.minBehaviorsDic[min].indexOf(d)) !== -1 ? this.behaviorChartY(this.minBehaviorsDic[min].indexOf(d)) : 0}
            )`
        })
        .attr('d', d => {
            this.symbolGenerator.type(d3[this.symbolBehaviorDic[d.behavior]]);
            return this.symbolGenerator();
        })
        .attr('fill', '#F75981')
        .attr('stroke', d3.rgb('#F75981').darker())
        .on('mouseenter', d => {
            this.tooltip.style('visibility', 'visible');
            let tooltipStr = `${new Date(d.time).toLocaleString('zh', {hour12: false})}:
            <br>${d.behavior}, cate ID: ${d.cateID}`;
            this.tooltip.html(tooltipStr);
            this.tooltip.style("left", (d3.event.pageX + 10) + "px");
            this.tooltip.style("top", (d3.event.pageY - 10) + "px");
        })
        .on('mouseleave', d => {
            this.tooltip.style('visibility', 'hidden');
        });

        if (this.highlightD) {
            this.highlight(true, this.highlightD);
        }
    }

    // 行为图曲线构造器
    behaviorLineConstructor(d, i) {
        if (i === 0) return;
        // 前一个d和当前d
        const prev = this.newUserMinBehaviors[i-1];
        const cur = d;
        const prevMin =  new Date(Number(prev.time)).getMinutes();
        const prevX = this.partMinX(prevMin);
        const prevY = this.behaviorChartY(this.minBehaviorsDic[prevMin].indexOf(prev)) !== -1 ? this.behaviorChartY(this.minBehaviorsDic[prevMin].indexOf(prev)) + 5 : 0;
        const curMin =  new Date(Number(cur.time)).getMinutes();
        const curX = this.partMinX(curMin);
        const curY = this.behaviorChartY(this.minBehaviorsDic[curMin].indexOf(cur)) !== -1 ? this.behaviorChartY(this.minBehaviorsDic[curMin].indexOf(cur)) - 7 : 0;
        const path = d3.path();
        path.moveTo(prevX, prevY);
        // 控制点1，控制点2，当前点
        const cpoint1 = [(prevX + curX) / 2, curY + 40],
        cpoint2 = [(prevX + curX) / 2, curY - 40],
        curPoint = [curX, curY];
        path.bezierCurveTo(...cpoint1, ...cpoint2, ...curPoint);
        return path;
    };

    // 高亮效果选择器
    highlight(isHighlight, d) {
        if (this.behaviorSymbolG) {
            this.behaviorSymbolG.selectAll('.behavior-symbol')
            .attr('fill', '#F75981');
            if (isHighlight) {
                this.behaviorSymbolG.selectAll('.behavior-symbol')
                .filter(p => p.cateID !== d.cateID)
                .attr('fill', '#ddd');
            }
        }
    }
    
};

export default new chart();