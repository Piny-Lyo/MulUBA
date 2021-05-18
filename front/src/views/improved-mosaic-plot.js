import * as d3 from 'd3';
import data from './data/improved-mosaic-plot.json';
import { getUserBehaviorsByUserID, updateUserID } from "../store/actions";

class chart {
    // 画布的宽高
    width = 0;
    height = 0;
    // 外边距
    margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 80
    };
    // color = d3.scaleOrdinal().domain(["0","1","2","3","4"]).range(['#1890FF', '#13C2C2', '#2FC25B', '#FACC14', '#F04864']);
    color = d3.scaleOrdinal().domain(["0","1","2","3","4"]).range(['#2E90D1', '#5ADBDC', '#FDD44A', '#FB8B6B', '#E0AAF0']);
    x = d3.scaleBand().paddingInner(0.1);
    y = d3.scaleBand();
    behaviorX = d3.scaleLog().base(2);

    // 初始化
    init(container) {
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        
        const svg = d3.select(container)
        .append('svg')
        .attr('width', this.width)
        .attr('height', this.height);
        
        this.x.domain(Object.keys(data.userProfiles)).range([0, this.width - this.margin.left - this.margin.right]);
        this.y.domain(d3.range(data.users.length)).range([0, this.height - this.margin.top - this.margin.bottom - 30 - 20]);
        // 矩形数组，用户属性数组
        this.rectArr = [];
        this.profileArr = [];
        this.profileLen = 0;
        if (this.rectArr.length === 0) {
            for (const key in data.userProfiles) {
                this.rectArr = this.rectArr.concat(data.userProfiles[key].map(el => ({
                    'el': el,
                    'profileArrI': Object.keys(data.userProfiles).indexOf(key)
                })));
                this.profileArr.push(data.userProfiles[key]);
            }
            this.profileLen = this.profileArr.reduce((pre, cur) => {
                pre += cur.length;
                return pre;
            }, this.profileLen);
            this.profileLen -= this.profileArr[6].length;
        }
        
        // user profile g
        const svgG = svg.append('g');
        const profileGJoin = svgG.selectAll('g').data(Object.keys(data.userProfiles))
        profileGJoin.exit().remove();
        const profileGEnter = profileGJoin.enter().append('g')
        .attr('class', 'profile-g')
        .merge(profileGJoin)
        .attr('transform', (d, i) => `translate(${this.margin.left + this.x(d)}, ${this.margin.top})`);
        
        // 一级矩形
        const profileOneG = profileGEnter.append('g');
        profileOneG.selectAll('rect').data(d => [d])
        .join('rect')
        .attr('width', this.x.bandwidth())
        .attr('height', this.height - this.margin.top - this.margin.bottom)
        .attr('stroke', '#F0F0F0')
        .attr('stroke-width', '1px')
        .attr('fill', '#FAFAFA');
        
        // 一级文字
        profileOneG.selectAll('text').data(d => [d])
        .join('text')
        .attr('font-size', '20px')
        .attr('dx', d => this.x.bandwidth() / 2)
        .attr('dy', d => 20)
        .attr('text-anchor', 'middle')
        .text(d => d)
        .attr('fill', '#2F4F4F');
        
        // 二级矩形
        const proficonstwoG = profileGEnter.append('g');
        proficonstwoG.selectAll('rect').data(
            d => data.userProfiles[d].map(el => ({'data': el, 'len': data.userProfiles[d].length}))
        )
        .join('rect')
        .attr('x', (d, i) => this.x.bandwidth() / d.len * i)
        .attr('y', (d, i) => 30)
        .attr('width', d => this.x.bandwidth() / d.len)
        .attr('height', 20)
        .attr('stroke', '#F0F0F0')
        .attr('stroke-width', '1px')
        .attr('fill', '#FAFAFA');
        
        // 二级文字
        proficonstwoG.selectAll('text').data(
            d => data.userProfiles[d].map(el => ({'data': el, 'len': data.userProfiles[d].length}))
        )
        .join('text')
        .attr('font-size', '14px')
        .attr('x', (d, i) => this.x.bandwidth() / d.len * i)
        .attr('y', (d, i) => 30)
        .attr('dx', (d, i) => (this.x.bandwidth() / d.len) / 2)
        .attr('dy', d => 15)
        .attr('text-anchor', 'middle')
        .text(d => d.data)
        .attr('fill', '#2F4F4F');

        // 马赛克图
        this.mosaicG = svgG.append('g')
        .attr('class', 'mosaic-g');

        // this.update();
    }
    
    // 更新数据，重绘视图
    update(users, dispatch) {
        let behaviorArr = users.reduce((pre, cur) => {
            return pre.concat(cur.userProfiles.slice(cur.userProfiles.length - this.profileArr[6].length));
        }, []);
        behaviorArr.forEach((el, i) => behaviorArr[i] = Number(el)+1);
        this.behaviorX.domain([d3.min(behaviorArr), d3.max(behaviorArr)]).range([0, this.x.bandwidth() / data.userProfiles.behaviors.length - 5]);
        // console.log(behaviorArr, d3.min(behaviorArr), d3.max(behaviorArr), this.behaviorX(6))

        const mosaicGJoin = this.mosaicG.selectAll('g').data(users);
        mosaicGJoin.exit().remove();
        const mosaicGEnter = mosaicGJoin.enter().append('g')
        .merge(mosaicGJoin)
        .attr('transform', (d, i) => `translate(${this.margin.left}, ${this.margin.top + 30 + 20 + this.y(i)})`);

        // 马赛克文字，用户id
        mosaicGEnter.selectAll('text').data(d => [d])
        .join('text')
        .attr('font-size', '12px')
        .attr('dx', d => -this.margin.left)
        .attr('dy', d => this.y.bandwidth() / 1.4)
        .text(d => d.userID)
        // .attr('fill', d => this.color(d.clusterType))
        .attr('fill', '#2F4F4F')
        .attr("cursor", "pointer")
        .on('click', d => {
            dispatch(getUserBehaviorsByUserID(d.userID));
            dispatch(updateUserID(d.userID));
            mosaicGEnter.selectAll('text')
            // .attr('fill', d => this.color(d.clusterType))
            .attr('fill', '#2F4F4F')
            .filter(p => p.userID === d.userID)
            .attr('fill', '#F04864');
        })

        // 用户行为矩形数组
        let behaviorRectArr = [];
        // 马赛克用户属性矩形
        mosaicGEnter.selectAll('.profile-rect').data((d, i) => {
            return this.rectArr.map(el => {
                const subArr = this.profileArr[el.profileArrI];
                let j = el.profileArrI, formerLenSum = 0;
                while (j !== 0) {
                    formerLenSum += this.profileArr[--j].length;
                }
                if (el.profileArrI === 6) {
                    if (Array.isArray(behaviorRectArr[i])) {
                        behaviorRectArr[i].push({'data': d, 'profile': el, 'i': el.profileArrI, 'len': subArr.length, 'formerLenSum': formerLenSum});
                    } else {
                        behaviorRectArr[i] = [{'data': d, 'profile': el, 'i': el.profileArrI, 'len': subArr.length, 'formerLenSum': formerLenSum}]
                    }
                }
                return {'data': d, 'profile': el, 'i': el.profileArrI, 'len': subArr.length, 'formerLenSum': formerLenSum};
            });
        })
        .join('rect')
        .attr('class', 'profile-rect')
        .attr('x', (d, i) => {
            // 整体偏移位置 + 相对自身所在一级rect偏移位置
            return (this.x.bandwidth()+this.x.step()*this.x.paddingInner())*d.i + this.x.bandwidth()/d.len*(i-d.formerLenSum);
        })
        .attr('width', d => this.x.bandwidth() / d.len)
        .attr('height', (d, i) => this.y.bandwidth())
        .attr('stroke', '#F0F0F0')
        .attr('stroke-width', '1px')
        .attr('fill', d => d.data.userProfiles[d.profile.profileArrI] === d.profile.el ? this.color(d.data.clusterType) : '#FAFAFA');

        //用户行为矩形
        mosaicGEnter.selectAll('.behavior-rect').data((d, i) => behaviorRectArr[i])
        .join('rect')
        .attr('class', 'behavior-rect')
        .attr('x', (d, i) => {
            // 整体偏移位置 + 相对自身所在一级rect偏移位置
            return (this.x.bandwidth()+this.x.step()*this.x.paddingInner())*d.i + this.x.bandwidth()/d.len*((i+this.profileLen)-d.formerLenSum);
        })
        .attr('width', (d, i) => this.behaviorX(Number(d.data.userProfiles[d.data.userProfiles.length - (this.profileArr[6].length - i)])+1))
        .attr('height', (d, i) => this.y.bandwidth())
        .attr('fill', d => this.color(d.data.clusterType));
    }
    
};

export default new chart();