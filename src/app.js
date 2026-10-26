const express = require('express');
const { ValidationError } = require('sequelize');
const articleRouter = require('./routes/article.routes');
const { fail } = require('./utils/response');

// 只负责创建并导出 Express 实例；监听端口在 src/server.js 中通过 app.listen() 完成
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/articles', articleRouter);

// 404
app.use((req, res) => {
  fail(res, 404, '接口不存在');
});

// 统一错误处理
app.use((err, req, res, next) => {
  // Sequelize 模型校验失败统一转成 400，接口层无需重复校验
  if (err instanceof ValidationError) {
    const errors = err.errors || [];
    const item = errors.find((e) => e.type !== 'string violation') || errors[0];
    return fail(res, 400, item ? item.message : '参数校验失败');
  }

  console.error('[error]', err);
  const status = err.status || 500;
  fail(res, status, status === 500 ? '服务器内部错误' : err.message);
});

module.exports = app;
