const express = require('express');
const { ValidationError } = require('sequelize');
const apiRouter = require('./routes');
const { fail } = require('./utils/response');

// 只负责创建并导出 Express 实例；监听端口在 src/server.js 中通过 app.listen() 完成
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// 业务接口按端划分，当前全部为后台管理端：/api/admin/*
app.use('/api', apiRouter);

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

  const status = err.status || 500;
  // 业务拦截（4xx）不算故障，只对 5xx 记录错误日志
  if (status >= 500) {
    console.error('[error]', err);
  }
  fail(res, status, status === 500 ? '服务器内部错误' : err.message);
});

module.exports = app;
