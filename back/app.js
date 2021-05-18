const Koa = require('koa');
const Cors = require('koa-cors');
const port = require('./config/index').port;
const router = require('./routes/index');

const app = new Koa();

// 跨域
app.use(Cors());

// 启动路由
app.use(router.routes())
  .use(router.allowedMethods());

app.listen(port, () => {
  console.log('This server is running at http://localhost:' + port)
});