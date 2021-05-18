const db = require('../config/db');
const sequelize = db.sequelize;
const Op = require('sequelize').Op;
const RawSampleClk = sequelize.import('../schema/raw-sample-clk');
const AdFeature = sequelize.import('../schema/ad-feature');

// 建立模型之间的关系
RawSampleClk.hasOne(AdFeature, {
    foreignKey: 'adgroup_id',
    sourceKey: 'adgroup_id'
});

class RawSampleClkModel {
    /**
     * 通过userID查询带有时序信息的用户广告点击行为
     * @param {*} userID 
     */
    static async queryUserBehaviorByUserID(userID) {
        return await RawSampleClk.findAll({
            attributes: ['user_id', 'time_stamp', 'clk'],
            where: {
                user_id: userID
            },
            raw: true
        });
    }

    /**
     * 通过timeStamp查询时间范围内的用户购物行为
     * @param {*} userID
     * @param {*} startTimeStamp
     * @param {*} endTimeStamp
     */
    static async queryUserBehaviorsByTimeStamp(userId, startTimeStamp, endTimeStamp) {
        return await RawSampleClk.findAll({
            attributes: ['time_stamp', 'clk', 'ad_feature1.cate_id', 'ad_feature1.price'],
            include: [{
                model: AdFeature,
                attributes: []
            }],
            where: {
                user_id: userId,
                time_stamp: {
                    [Op.gte]: startTimeStamp,
                    [Op.lte]: endTimeStamp
                }
            },
            raw: true
        });
    }
}

module.exports = RawSampleClkModel;