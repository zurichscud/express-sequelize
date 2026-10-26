'use strict';

const articles = [
  {
    title: '深入理解 Express 中间件',
    summary: '中间件是 Express 的核心，本文从执行顺序讲到错误处理。',
    content:
      'Express 应用本质上是一条中间件流水线。每个中间件都能访问 req、res 和 next，通过调用 next() 将控制权交给下一个中间件。理解注册顺序、挂载路径以及错误中间件的四个参数，是写出可维护服务端代码的第一步。',
    author: '张三',
    status: 'published',
    views: 128
  },
  {
    title: 'Sequelize 模型定义与关联关系入门',
    summary: '用数据模型描述表结构，并处理一对多、多对多关联。',
    content:
      'Sequelize 通过 define 或 Model.init 描述表结构。hasMany / belongsTo 建立一对多关系，belongsToMany 通过中间表建立多对多关系。配合 underscored 和 freezeTableName，可以让模型命名与数据库规范保持一致。',
    author: '李四',
    status: 'published',
    views: 96
  },
  {
    title: '在 WSL2 中运行 MySQL 并用 Windows 访问',
    summary: 'WSL2 的 localhost 转发让 Windows 应用可以直连 Linux 里的 MySQL。',
    content:
      'WSL2 默认开启 localhostForwarding，Windows 访问 127.0.0.1:3306 会转发到 WSL 内监听的端口。若不通，可在 WSL 中执行 hostname -I 获取虚拟网卡地址，并检查 MySQL 的 bind-address 与防火墙配置。',
    author: '王五',
    status: 'published',
    views: 210
  },
  {
    title: '使用 Node.js 构建 RESTful API 的 10 个建议',
    summary: '统一响应结构、输入校验、分页、错误码与日志缺一不可。',
    content:
      '设计 RESTful API 时，先约定资源路径和响应格式；对分页参数做上限保护；把数据库错误转换为稳定的业务错误码；记录请求日志与慢查询；最后用自动化测试覆盖关键路径。这些习惯能显著降低后期维护成本。',
    author: '赵六',
    status: 'published',
    views: 305
  },
  {
    title: '接口分页与关键词搜索的实践',
    summary: '基于 findAndCountAll 实现稳定的分页查询。',
    content:
      '分页查询需要同时返回当前页数据和总数。Sequelize 的 findAndCountAll 会在一次调用中执行 count 和 select。注意为排序字段建立索引，并对 pageSize 设置上限，避免一次性拉取过多数据。',
    author: '张三',
    status: 'draft',
    views: 0
  },
  {
    title: 'utf8mb4 与 Emoji 存储',
    summary: 'MySQL 的 utf8 只有三字节，存 Emoji 请使用 utf8mb4。',
    content:
      'MySQL 中的 utf8 实际是 utf8mb3，最多三个字节，无法完整存储四字节的 Emoji。建库、建表和连接字符集都应设置为 utf8mb4，并搭配 utf8mb4_unicode_ci 或 utf8mb4_0900_ai_ci 排序规则。',
    author: '李四',
    status: 'published',
    views: 57
  }
];

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'articles',
      articles.map((article) => ({
        ...article,
        created_at: now,
        updated_at: now
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('articles', null, {});
  }
};
