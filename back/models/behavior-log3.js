const db = require('../config/db');
const sequelize = db.sequelize;
const Op = require('sequelize').Op;
const BehaviorLog3 = sequelize.import('../schema/behavior-log3');

class BehaviorLogModel3 {
    /**
     * 通过timeStamp查询时间范围内的用户购物行为
     * @param {*} userID 
     * @param {*} startTimeStamp 
     * @param {*} endTimeStamp 
     */
    static async queryUserBehaviorsByTimeStamp(userId, startTimeStamp, endTimeStamp) {
        return await BehaviorLog3.findAll({
            attributes: ['time_stamp', 'btag', 'cate_id'],
            where: {
                user_id: userId,
                time_stamp: {
                    [Op.gte]: startTimeStamp,
                    [Op.lte]: endTimeStamp
                }
                // [Op.and]: [
                //     {time_stamp: {[Op.gte]: startTimeStamp}}, 
                //     {time_stamp: {[Op.lte]: endTimeStamp}}
                // ]
            },
            raw: true
        });
    }
}

module.exports = BehaviorLogModel3;