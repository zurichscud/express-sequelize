require('dotenv').config({ quiet: true });
// require 会立即执行 app.js，完成 Express 实例、中间件和路由的注册
const app = require('./app');
const { sequelize } = require('./models');

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  try {
    await sequelize.authenticate();
    // 真正开始监听端口，app.js 中注册的路由从这里对外提供服务
    app.listen(PORT, () => {
      console.log(`[server] 已启动：http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('服务启动失败：', err.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`\n[server] 收到 ${signal}，正在关闭...`);
  try {
    await sequelize.close();
  } finally {
    process.exit(0);
  }
}

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => shutdown(signal));
});

bootstrap();
