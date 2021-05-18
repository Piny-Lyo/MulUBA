const db = require('../config/db');
const sequelize = db.sequelize;
const UserProfile = sequelize.import('../schema/user-profile');
const UserProfileBehaviorCluster = sequelize.import('../schema/user-profile-behavior-cluster');

// 建立模型之间的关系
UserProfile.hasOne(UserProfileBehaviorCluster, {
    foreignKey: 'user_id',
    // sourceKey: 'user_id'
});

class UserProfileModel {
    /**
     * 查询num条数据
     */
    static async queryUserByUserID(userID) {
        return await UserProfile.findOne({
            attributes: ['user_id', 'gender_code', 'age_level', 'pvalue_level', 'shopping_level', 'occupation_code', 'city_level',
            'user_profile3_behavior_cluster_100.pv', 'user_profile3_behavior_cluster_100.cart', 'user_profile3_behavior_cluster_100.fav', 
            'user_profile3_behavior_cluster_100.buy', 'user_profile3_behavior_cluster_100.clk', 'user_profile3_behavior_cluster_100.cluster_type'],
            include: [{
                model: UserProfileBehaviorCluster,
                attributes: []
            }],
            where: {
                user_id: userID
            },
            raw: true
        });
    }
}

module.exports = UserProfileModel;