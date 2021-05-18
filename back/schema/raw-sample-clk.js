module.exports = function (sequelize, DataTypes) {
    return sequelize.define('raw_sample4_clk_100', {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        time_stamp: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        adgroup_id: {
            type: DataTypes.STRING,
            primaryKey: false,
            allowNull: true,
            references: {
                model: 'ad_feature1',
                key: 'adgroup_id'
            }
        },
        clk: {
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