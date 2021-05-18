const db = require('../config/db');
const sequelize = db.sequelize;
const AdFeature = sequelize.import('../schema/ad-feature');

class AdFeatureModel {
    /**
     * 查询num条数据
     */
    static async getData(num) {
        return await AdFeature.findAll({
            limit: Number(num)
        });
    }
}

module.exports = AdFeatureModel;