module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user_profile3_100', {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'behavior_log5',
                key: 'user_id'
            }
        },
        gender_code: {
            type: DataTypes.STRING,
            primaryKey: false,
            allowNull: true,
        },
        age_level: {
            type: DataTypes.STRING,
            primaryKey: false,
            allowNull: true,
        },
        pvalue_level: {
            type: DataTypes.STRING,
            primaryKey: false,
            allowNull: true,
        },
        shopping_level: {
            type: DataTypes.STRING,
            primaryKey: false,
            allowNull: true,
        },
        occupation_code: {
            type: DataTypes.STRING,
            primaryKey: false,
            allowNull: true,
        },
        city_level: {
            type: DataTypes.STRING,
            primaryKey: false,
            allowNull: true,
        }
    }, {
        // 如果为 true 则表的名称和 model 相同，即 user
        // 为 false 数据库创建的表名称会是复数 users
        // 如果指定的表名称本就是复数形式则不变
        freezeTableName: true,
        // 不让 sequelize 为模型添加 createdAt 和 updatedAt 两个时间戳字段
        timestamps: false,
    })

}