const db = require('../config/db');
const sequelize = db.sequelize;
const BehaviorLog5 = sequelize.import('../schema/behavior-log5');

class BehaviorLogModel5 {
    /**
     * 通过userID查询带有时序信息的用户购物行为
     * @param {*} userID 
     */
    static async queryUserBehaviorByUserID(userID) {
        return await BehaviorLog5.findAll({
            attributes: ['user_id', 'time_stamp', 'btag'],
            where: {
                user_id: userID
            },
            raw: true
        });
    }
}

module.exports = BehaviorLogModel5;