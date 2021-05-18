const utils = require('../utils');
const UserProfileModel = require('../models/user-profile');
const BehaviorLogModel3 = require('../models/behavior-log3');
const BehaviorLogModel5 = require('../models/behavior-log5');
const RawSampleClkModel = require('../models/raw-sample-clk');

class APIController {
    // 通过userID查询用户信息
    static async getUserByUserID(ctx) {
        const userID = ctx.query.userID;
        if (userID) {
            try {
                const res = await UserProfileModel.queryUserByUserID(userID);
                let attributeArr = [];
                for (const key in res) {
                    if (key !== 'user_id' && key !== 'cluster_type') {
                        if (key !== 'pv' && key !== 'cart' && key !== 'fav' && key !== 'buy' && key !== 'clk' ) {
                            attributeArr.push(utils.dbProfileToFE(key, res[key]));
                        } else {
                            attributeArr.push(res[key]);
                        }
                    }
                };
                const newRes = {
                    "userID": res.user_id,
                    "clusterType": res.cluster_type,
                    "userProfiles": attributeArr
                };
                ctx.response.status = 200;
                ctx.body = {
                    code: 200,
                    msg: 'success',
                    res: newRes
                };
            } catch (err) {
                // 412：先决条件失败
                ctx.response.status = 412;
                ctx.body = {
                    code: 412,
                    msg: 'fail',
                    res: err
                };
            }
        } else {
            // 416：所请求的范围无法满足
            ctx.response.status = 416;
            ctx.body = {
                code: 416,
                msg: 'The param userID is necessary'
            };
        }
    }

    // 通过userID查询带有时序信息的用户购物行为和广告点击行为
    static async getUserBehaviorsByUserID(ctx) {
        const userID = ctx.query.userID;
        if (userID) {
            try {
                let newRes0 = [], newRes1 = [], res0Dic = {}, res1Dic = {};
                //查询购物行为
                const res0 = await BehaviorLogModel5.queryUserBehaviorByUserID(userID);
                // 从2017年4月22日开始
                const res0StartTime = new Date(2017, 3, 22, 0, 0, 0).getTime();
                // 初始化res0Dic字典
                for (let i = 0; i < 21; i++) {
                    res0Dic[res0StartTime + (i * 24 * 60 * 60 * 1000)] = {
                        'pv': 0,
                        'cart': 0,
                        'fav': 0,
                        'buy': 0
                    };
                }
                res0.forEach(el => {
                    res0Dic[utils.getStartTime(utils.dbTimeStampToFETime(el.time_stamp))][el.btag] = ++res0Dic[utils.getStartTime(utils.dbTimeStampToFETime(el.time_stamp))][el.btag];
                });
                for (const key in res0Dic) {
                    for (const behavior in res0Dic[key]) {
                        newRes0.push({
                            'time': Number(key),
                            'behavior': behavior,
                            'value': res0Dic[key][behavior]
                        })
                    }
                }
                // 按时间排序会出现行为类型不按pv, cart, fav, buy的形式排序
                // newRes0.sort((a, b) => utils.ascending(a.time, b.time));
                // 查询广告点击行为
                const res1 = await RawSampleClkModel.queryUserBehaviorByUserID(userID);
                // 从2017年5月6日开始
                const res1StartTime = new Date(2017, 4, 6, 0, 0, 0).getTime();
                // 初始化res0Dic字典
                for (let i = 0; i < 7; i++) {
                    res1Dic[res1StartTime + (i * 24 * 60 * 60 * 1000)] = 0;
                }
                res1.forEach(el => {
                    res1Dic[utils.getStartTime(utils.dbTimeStampToFETime(el.time_stamp))] = ++res1Dic[utils.getStartTime(utils.dbTimeStampToFETime(el.time_stamp))];
                });
                for (const key in res1Dic) {
                    newRes1.push({
                        'time': Number(key),
                        'behavior': 'clk',
                        'value': res1Dic[key]
                    })
                }
                // newRes1.sort((a, b) => utils.ascending(a.time, b.time));
                const newRes = {
                    shoppingBehaviors: newRes0,
                    clkBehaviors: newRes1
                };
                ctx.response.status = 200;
                ctx.body = {
                    code: 200,
                    msg: 'success',
                    res: newRes
                };
            } catch (err) {
                // 412：先决条件失败
                ctx.response.status = 412;
                ctx.body = {
                    code: 412,
                    msg: 'fail',
                    res: err
                };
            }
        } else {
            // 416：所请求的范围无法满足
            ctx.response.status = 416;
            ctx.body = {
                code: 416,
                msg: 'The param userID is necessary'
            };
        }
    }

     // 通过userID和time查询hourBehaviorOfWeek，hourBehaviorOfDay
     static async getUserBehaviorsOfHourByTime(ctx) {
        const userID = ctx.query.userID;
        const time = ctx.query.time;
        if (userID && time) {
            try {
                let hourBehaviorOfWeek = [], hourBehaviorOfDay = [];
                // 单独统计点击行为
                let hourClkOfWeek = [], hourClkOfDay = [];
                // 选中的那天的起止时间
                const dayStartTime = utils.getStartTime(time);
                const dayEndTime = utils.getEndTime(time);
                // 从2017年5月6日开始到2017年5月12日结束
                const weekStartTimeStamp = utils.feTimeToDBTimeStamp(new Date(2017, 4, 6, 0, 0, 0).getTime());
                const weekEndTimeStamp = utils.feTimeToDBTimeStamp(new Date(2017, 4, 12, 23, 59, 59).getTime());
                // 查询购物行为和广告点击行为
                const res0 = await BehaviorLogModel3.queryUserBehaviorsByTimeStamp(userID, weekStartTimeStamp, weekEndTimeStamp);
                const res1 = await RawSampleClkModel.queryUserBehaviorsByTimeStamp(userID, weekStartTimeStamp, weekEndTimeStamp);
                // 初始化hourBehaviorOfWeek和hourBehaviorOfDay
                for (let i = 0; i < 24; i++) {
                    hourBehaviorOfWeek.push(0);
                    hourBehaviorOfDay.push(0);

                    hourClkOfWeek.push(0);
                    hourClkOfDay.push(0);
                }
                const tempRes = res0.concat(res1);
                tempRes.forEach(el => {
                    const feTime = utils.dbTimeStampToFETime(el.time_stamp);
                    hourBehaviorOfWeek[new Date(feTime).getHours()] = ++hourBehaviorOfWeek[new Date(feTime).getHours()];
                    if (feTime >= dayStartTime && feTime <= dayEndTime) {
                        hourBehaviorOfDay[new Date(feTime).getHours()] = ++hourBehaviorOfDay[new Date(feTime).getHours()];
                    }
                });
                res1.forEach(el => {
                    const feTime = utils.dbTimeStampToFETime(el.time_stamp);
                    hourClkOfWeek[new Date(feTime).getHours()] = ++hourClkOfWeek[new Date(feTime).getHours()];
                    if (feTime >= dayStartTime && feTime <= dayEndTime) {
                        hourClkOfDay[new Date(feTime).getHours()] = ++hourClkOfDay[new Date(feTime).getHours()];
                    }
                });
                const newRes = {
                    hourBehaviorOfWeek,
                    hourBehaviorOfDay,
                    hourClkOfWeek,
                    hourClkOfDay
                };
                ctx.response.status = 200;
                ctx.body = {
                    code: 200,
                    msg: 'success',
                    res: newRes
                };
            } catch (err) {
                // 412：先决条件失败
                ctx.response.status = 412;
                ctx.body = {
                    code: 412,
                    msg: 'fail',
                    res: err
                };
            }
        } else {
            // 416：所请求的范围无法满足
            ctx.response.status = 416;
            ctx.body = {
                code: 416,
                msg: 'The param userID & time is necessary'
            };
        }
    }

    // 通过userID和time查询min behavior of hour
    static async getUserBehaviorsOfMinByTime(ctx) {
        const userID = ctx.query.userID;
        const time = ctx.query.time;
        if (userID && time) {
            try {
                let minBehaviorsOfHour = [];
                // 选中的那个小时的起止时间戳
                const hourStartTimeStamp = utils.feTimeToDBTimeStamp(utils.getStartTimeOfHour(time));
                const hourEndTimeStamp = utils.feTimeToDBTimeStamp(utils.getEndTimeOfHour(time));
                // // 查询购物行为和广告点击行为
                // const res0 = await BehaviorLogModel3.queryUserBehaviorsByTimeStamp(userID, hourStartTimeStamp, hourEndTimeStamp);
                // const res1 = await RawSampleClkModel.queryUserBehaviorsByTimeStamp(userID, hourStartTimeStamp, hourEndTimeStamp);
                // // 初始化minBehaviorOfHour
                // for (let i = 0; i < 60; i++) {
                //     minBehaviorsOfHour.push(0);
                // }
                // const tempRes = res0.concat(res1);
                // tempRes.forEach(el => {
                //     const feTime = utils.dbTimeStampToFETime(el.time_stamp);
                //     minBehaviorsOfHour[new Date(feTime).getMinutes()] = ++minBehaviorsOfHour[new Date(feTime).getMinutes()];
                // });
                // const newRes = minBehaviorsOfHour;

                let newRes0 =[], newRes1 = [];
                const res0 = await BehaviorLogModel3.queryUserBehaviorsByTimeStamp(userID, hourStartTimeStamp, hourEndTimeStamp);
                res0.forEach(el => {
                    newRes0.push({
                        'time': utils.dbTimeStampToFETime(el.time_stamp),
                        'behavior': el.btag,
                        'cateID': el.cate_id
                    })
                });
                const res1 = await RawSampleClkModel.queryUserBehaviorsByTimeStamp(userID, hourStartTimeStamp, hourEndTimeStamp);
                res1.forEach(el => {
                    newRes1.push({
                        'time': utils.dbTimeStampToFETime(el.time_stamp),
                        'behavior': 'clk',
                        'cateID': el.cate_id,
                        'price': el.price
                    })
                });
                const newRes2 = newRes0.concat(newRes1);
                newRes2.sort((a, b) => utils.ascending(a.time, b.time));

                // 初始化minBehaviorOfHour
                for (let i = 0; i < 60; i++) {
                    minBehaviorsOfHour.push(0);
                }
                newRes2.forEach(el => {
                    const feTime = el.time;
                    minBehaviorsOfHour[new Date(feTime).getMinutes()] = ++minBehaviorsOfHour[new Date(feTime).getMinutes()];
                });
                const newRes = {
                    minBehaviorsOfHour: minBehaviorsOfHour,
                    userMinBehaviors: newRes2,
                }

                ctx.response.status = 200;
                ctx.body = {
                    code: 200,
                    msg: 'success',
                    res: newRes
                };
            } catch (err) {
                // 412：先决条件失败
                ctx.response.status = 412;
                ctx.body = {
                    code: 412,
                    msg: 'fail',
                    res: err
                };
            }
        } else {
            // 416：所请求的范围无法满足
            ctx.response.status = 416;
            ctx.body = {
                code: 416,
                msg: 'The param userID & time is necessary'
            };
        }
    }

    // // 通过userID和time查询时间范围内的用户购物行为和广告点击行为
    // static async getMinUserBehaviorsByTime(ctx) {
    //     const userID = ctx.query.userID;
    //     const time = ctx.query.time;
    //     if (userID && time) {
    //         try {
    //             let newRes0 = [], newRes1 = [];
    //             // 选中的那个小时的起止时间戳
    //             const hourStartTimeStamp = utils.feTimeToDBTimeStamp(utils.getStartTimeOfHour(time));
    //             const hourEndTimeStamp = utils.feTimeToDBTimeStamp(utils.getEndTimeOfHour(time))
    //             const res0 = await BehaviorLogModel3.queryUserBehaviorsByTimeStamp(userID, hourStartTimeStamp, hourEndTimeStamp);
    //             res0.forEach(el => {
    //                 newRes0.push({
    //                     'time': utils.dbTimeStampToFETime(el.time_stamp),
    //                     'behavior': el.btag,
    //                     'cateID': el.cate_id
    //                 })
    //             });
    //             const res1 = await RawSampleClkModel.queryUserBehaviorsByTimeStamp(userID, hourStartTimeStamp, hourEndTimeStamp);
    //             res1.forEach(el => {
    //                 newRes1.push({
    //                     'time': utils.dbTimeStampToFETime(el.time_stamp),
    //                     'behavior': 'clk',
    //                     'cateID': el.cate_id,
    //                     'price': el.price
    //                 })
    //             });
    //             const newRes = newRes0.concat(newRes1);
    //             newRes.sort((a, b) => utils.ascending(a.time, b.time));
    //             ctx.response.status = 200;
    //             ctx.body = {
    //                 code: 200,
    //                 msg: 'success',
    //                 res: newRes
    //             };
    //         } catch (err) {
    //             // 412：先决条件失败
    //             ctx.response.status = 412;
    //             ctx.body = {
    //                 code: 412,
    //                 msg: 'fail',
    //                 res: err
    //             };
    //         }
    //     } else {
    //         // 416：所请求的范围无法满足
    //         ctx.response.status = 416;
    //         ctx.body = {
    //             code: 416,
    //             msg: 'The param userID & time is necessary'
    //         };
    //     }
    // }
}

module.exports = APIController;