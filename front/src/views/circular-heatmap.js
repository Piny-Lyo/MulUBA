import * as d3 from 'd3';
import _ from 'lodash';
import { updateDayTime, getUserBehaviorsOfHourByTime } from "../store/actions";

class chart {
    behaviors = ['pv', 'cart', 'fav', 'buy'];
    dayArr = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // 周配色
    weekColor = d3.scaleOrdinal()
    .domain(d3.range(7))
    // .range(["#8dd3c7", "#fccde5", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69"]);
    .range(['#C0C0C0', '#C0C0C0', '#C0C0C0', '#C0C0C0', '#C0C0C0', '#C0C0C0', '#C0C0C0']);
    // 热力图配色
    heatColor = d3.scaleSequential(d3.interpolatePuBu);
    // 周的角度比例尺
    weekTheta = d3.scaleLinear()
    .domain([0, this.dayArr.length])
    .range([0, Math.PI * 2]);
    // 日的角度比例尺对象
    dayThetasObj = {};
    // tooltip
    tooltip = null;
    
    // 初始化
    init(container) {
        this.width = container.clientWidth;
        this.height = container.clientHeight;

        this.tooltip = d3.select('.view-d .tooltip');
        
        const svg = d3.select(container)
        .append('svg')
        .attr('width', this.width)
        .attr('height', this.height);
        
        // 最外层圆的半径
        this.weekOuterRadius = Math.min(this.width, this.height) / 2;
        // 块的宽度，包括周块和日块，比如Mon的宽度
        this.blockWidth = this.weekOuterRadius * 0.1;
        // 周和日之间的间距
        this.blockMargin = this.weekOuterRadius * 0.05;
        // 周的圆内半径
        this.weekInnerRadius = this.weekOuterRadius - this.blockWidth;
        // 周块的间隔角度
        this.padAngle = 0.02;
        // 周块的圆角
        this.cornerRadius = 6;
        // 周块label字体大小
        this.weekLabelSize = 14;
        // 日的外半径
        this.dayOuterRadius = this.weekInnerRadius - this.blockMargin;
        // 日的内半径
        this.dayInnerRadius = this.dayOuterRadius - this.blockWidth;

        // 周的弧构造器
        this.weekArc = d3.arc()
        .padAngle(this.padAngle)
        .cornerRadius(this.cornerRadius)
        .innerRadius(this.weekInnerRadius)
        .outerRadius(this.weekOuterRadius);

        // 玫瑰图半径比例尺
        this.radiusScale = d3.scaleLinear()
        .range([0, this.dayInnerRadius - 2%3*(this.dayOuterRadius - this.dayInnerRadius) - 10]);
        
        // 玫瑰图弧构造器
        this.roseArc = d3.arc()
        .padAngle(this.padAngle)
        .cornerRadius(this.cornerRadius);

        // 画最外层的圆
        this.circleG = svg.append('g').attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);
        // 画内部南丁格尔玫瑰图
        this.roseG = svg.append('g').attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

        // 构造初始化demo数据
        const startDate = new Date(2017, 3, 22, 0, 0).getTime();
        const tempData = d3.range(21).map(d => {
            return d3.range(4).map(el=> ({
                time: new Date(startDate + (d * 24 * 60 * 60 * 1000)).getTime(),
                behavior: this.behaviors[~~el],
                value: 0
            }));
        });
        let shoppingBehaviors = [];
        tempData.forEach(el => {
            shoppingBehaviors = shoppingBehaviors.concat(el);
        });

        shoppingBehaviors = this.shoppingBehaviorsStructureConstructor(shoppingBehaviors);

        // 日的角度比例尺
        this.dayThetasConstructor(shoppingBehaviors);

        // 每个月和日的包裹g
        this.weekG = this.circleG.selectAll('.week-g').data(shoppingBehaviors)
        .join('g')
        .attr('class', d => d.key + ' week-g');

        // 周g
        this.weekWrap = this.weekG.selectAll('.week-wrap')
        .data(d => [d])
        .join('g')
        .attr('class', 'week-wrap');
        // 包裹g中的path，用来画外层弧
        this.weekWrap.selectAll('.week')
        .data(d => [d])
        .join('path')
        .attr('class', 'week')
        .attr('id', d => 'path-' + d.key)
        .attr('fill', d => this.weekColor(d.key))
        .attr('d', (d, i) => {
            const angles = this.getWeekAngle(d.key);
            return this.weekArc({
                startAngle: angles[0],
                endAngle: angles[1]
            })
        });
        // 周文字
        const weekText = this.weekWrap.selectAll('.week-label')
        .data(d => [d])
        .join('text')
        .attr('class', 'week-label')
        .attr('text-anchor', 'middle')
        .attr('font-size', this.weekLabelSize)
        .attr('x', (d, i) => {
            const angles = this.getWeekAngle(d.key);
            const halfAngle = (angles[1] - angles[0]) / 2;
            return (halfAngle * this.weekOuterRadius) + (this.cornerRadius / 2);
        })
        .attr('dy', d => (this.blockWidth / 2) + (this.weekLabelSize / 3));
        // 文字中添加textPath
        weekText.selectAll('textPath')
        .data(d => [d])
        .join('textPath')
        .attr("class", "textpath")
        .attr("fill", "#2F4F4F")
        .attr("xlink:href", d => '#path-' + d.key)
        .text(d => d.key);
        
        // 日g
        this.dayG = this.weekG.selectAll('.day-g')
        .data(d => [d])
        .join('g')
        .attr('class', 'day-g')

        this.dayG.selectAll('.day')
        .data(d => d.values)
        .join('path')
        .attr('class', 'day')
        .attr('fill', d => this.heatColor(d.value))
        .attr('d', (d, i) => {
            const thetaScale = this.dayThetasObj[new Date(d.time).toDateString().split(' ')[0]];
            return d3.arc()({
                innerRadius: this.dayInnerRadius - i%3*(this.dayOuterRadius - this.dayInnerRadius),
                outerRadius: this.dayOuterRadius - i%3*(this.dayOuterRadius - this.dayInnerRadius),
                startAngle: thetaScale(this.behaviors.indexOf(d.behavior)),
                endAngle: thetaScale(this.behaviors.indexOf(d.behavior) + 1)
            });
        });

    }
    
    // 更新数据，重绘视图
    update(userBehaviors, userID, dispatch) {
        let shoppingBehaviors = _.cloneDeep(userBehaviors.shoppingBehaviors);
        const clkBehaviors = _.cloneDeep(userBehaviors.clkBehaviors);
        
        shoppingBehaviors = this.shoppingBehaviorsStructureConstructor(shoppingBehaviors);

        let shoppingBehaviorsArr = [];
        shoppingBehaviors.forEach(el => {
            el.values.forEach(values => {
                shoppingBehaviorsArr.push(Number(values.value));
            })
        });
        this.heatColor.domain(d3.extent(shoppingBehaviorsArr));


        // 日的角度比例尺
        this.dayThetasConstructor(shoppingBehaviors);
        
        // 每个月和日的包裹g
        this.weekG = this.circleG.selectAll('.week-g').data(shoppingBehaviors)
        .join('g')
        .attr("cursor", "pointer")
        .on('mouseenter', d => {
            this.tooltip.style('visibility', 'visible');
            let tooltipStr = `<br>1st Week: ${d.values[0].behavior} ${d.values[0].value}, ${d.values[1].behavior} ${d.values[1].value}, ${d.values[2].behavior} ${d.values[2].value}, ${d.values[3].behavior} ${d.values[3].value}
            <br>2nd Week: ${d.values[4].behavior} ${d.values[4].value}, ${d.values[5].behavior} ${d.values[5].value}, ${d.values[6].behavior} ${d.values[6].value}, ${d.values[7].behavior} ${d.values[7].value}
            <br>3rd Week: ${d.values[8].behavior} ${d.values[8].value}, ${d.values[9].behavior} ${d.values[9].value}, ${d.values[10].behavior} ${d.values[10].value}, ${d.values[11].behavior} ${d.values[11].value}`;
            // tooltipStr = `${new Date(d.values[0].time).toLocaleDateString()} - ${new Date(d.values[11].time).toLocaleDateString()}` + tooltipStr;
            tooltipStr = `2017/4/22 - 2017/5/12 ${d.key}` + tooltipStr;
            this.tooltip.html(tooltipStr);
            this.tooltip.style("left", (d3.event.pageX + 10) + "px");
            this.tooltip.style("top", (d3.event.pageY - 10) + "px");
        })
        .on('mouseleave', d => {
            this.tooltip.style('visibility', 'hidden');
        })
        .on('click', d => {
            dispatch(updateDayTime(d.values[d.values.length-1].time));
            dispatch(getUserBehaviorsOfHourByTime({
                'userID': userID,
                'time': d.values[d.values.length-1].time
            }));
            this.weekWrap.selectAll('.week')
            .attr('fill', d => this.weekColor(d.key))
            .filter(p => p.key === d.key)
            .attr('fill', '#F04864');
        });
        
        // 日g
        this.dayG = this.weekG.selectAll('.day-g')
        .data(d => [d])
        .join('g')

        this.dayG.selectAll('.day')
        .data(d => d.values)
        .join('path')
        .attr('fill', d => this.heatColor(d.value))

        this.radiusScale.domain([0, clkBehaviors.reduce((maxValue, currentData) => Math.max(currentData.value, maxValue), 0)]);
        // 玫瑰花瓣
        this.roseG.selectAll('path').data(clkBehaviors)
        .join('path')
        .attr('d', (d, i) => this.roseArc({
            data: {day: d.time, behavior: d.behavior, value: d.value},
            innerRadius: 0,
            outerRadius: Number(d.value) === 0 ? 0 : this.radiusScale(d.value),
            startAngle: this.getWeekAngle(new Date(d.time).toDateString().split(' ')[0])[0],
            endAngle: this.getWeekAngle(new Date(d.time).toDateString().split(' ')[0])[1],
        }))
        .attr('fill', '#2DB8E3')
        .on('mouseenter', d => {
            this.tooltip.style('visibility', 'visible');
            let tooltipStr = `${new Date(d.time).toLocaleDateString()}: ${d.behavior} ${d.value}`;
            this.tooltip.html(tooltipStr);
            this.tooltip.style("left", (d3.event.pageX + 10) + "px");
            this.tooltip.style("top", (d3.event.pageY - 10) + "px");
        })
        .on('mouseleave', d => {
            this.tooltip.style('visibility', 'hidden');
        });
    }

    getWeekAngle(week) {
        const startAngle = this.weekTheta(this.dayArr.indexOf(week));
        const endAngle = this.weekTheta(this.dayArr.indexOf(week)+1);
        return [startAngle, endAngle];
    }

    shoppingBehaviorsStructureConstructor(shoppingBehaviors) {
        return d3.nest()
        .key(d => new Date(d.time).toDateString().split(' ')[0])
        .entries(shoppingBehaviors);
    }

    dayThetasConstructor(shoppingBehaviors) {
        shoppingBehaviors.forEach((d, i) => {
            const angles = this.getWeekAngle(d.key);
            const startRange = angles[0] + this.padAngle;
            const endRange = angles[1] - this.padAngle;
            this.dayThetasObj[d.key] = d3.scaleLinear()
            .domain([0, this.behaviors.length])
            .range([startRange, endRange]);
        });
    }
    
};



export default new chart();