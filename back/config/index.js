//数据库配置文件
const config = {
    port: 5201,  // 项目启动端口号
    database:{   // 数据库配置信息
        // host: '192.168.0.132',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        // password: 'vcl318',
        password: '',
        database: 'pdd_xwlw'
    }
}

module.exports = config;