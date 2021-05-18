module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user_profile3_behavior_cluster_100', {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'user_profile3',
                key: 'user_id'
            }
        },
        // user_id_foreign: {
        //     type: DataTypes.STRING,
        //     field: 'user_id',
        //     references: {
        //         model: 'user_profile32222',
        //         key: 'user_id123'
        //     }
        // },
        pv: {
            type: DataTypes.STRING,
            primaryKey: false,
            allowNull: true,
        },
        cart: {
            type: DataTypes.STRING,
            primaryKey: false,
            allowNull: true,
        },
        fav: {
            type: DataTypes.STRING,
            primaryKey: false,
            allowNull: true,
        },
        buy: {
            type: DataTypes.STRING,
            primaryKey: false,
            allowNull: true,
        },
        clk: {
            type: DataTypes.STRING,
            primaryKey: false,
            allowNull: true,
        },
        cluster_type: {
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