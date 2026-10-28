'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    // 已存在数据时跳过
    const rows = await queryInterface.sequelize.query('SELECT COUNT(*) AS count FROM `courses`', {
      type: queryInterface.sequelize.QueryTypes.SELECT
    });
    if (Number(rows[0].count) > 0) {
      return;
    }

    const now = new Date();
    // 依赖 app_users / categories 种子先执行（按文件名顺序保证）
    // chapter_count 由章节接口按 chapters 实际数量维护，种子课程统一从 0 开始
    await queryInterface.bulkInsert('courses', [
      {
        category_id: 1,
        user_id: 1,
        name: 'Vue 3 从入门到实战',
        image: 'https://picsum.photos/seed/course-vue/640/360',
        is_recommended: true,
        content: '从组合式 API 讲到工程化实践，带你完整开发一个中后台项目。',
        like_count: 128,
        chapter_count: 0,
        created_at: now,
        updated_at: now
      },
      {
        category_id: 1,
        user_id: 1,
        name: 'React 18 核心原理与源码解析',
        image: 'https://picsum.photos/seed/course-react/640/360',
        is_recommended: true,
        content: '深入 Fiber 架构、并发特性与调度机制，读懂 React 设计思想。',
        like_count: 96,
        chapter_count: 0,
        created_at: now,
        updated_at: now
      },
      {
        category_id: 2,
        user_id: 1,
        name: 'Node.js 中间件设计模式',
        image: 'https://picsum.photos/seed/course-node/640/360',
        is_recommended: true,
        content: '以 Express 为例拆解中间件流水线，覆盖错误处理与鉴权实践。',
        like_count: 210,
        chapter_count: 0,
        created_at: now,
        updated_at: now
      },
      {
        category_id: 2,
        user_id: 1,
        name: 'MySQL 索引优化实战',
        image: 'https://picsum.photos/seed/course-mysql/640/360',
        is_recommended: false,
        content: '从 B+ 树原理到执行计划分析，系统讲解慢查询排查与优化。',
        like_count: 88,
        chapter_count: 0,
        created_at: now,
        updated_at: now
      },
      {
        category_id: 3,
        user_id: 2,
        name: 'Flutter 跨平台移动开发',
        image: 'https://picsum.photos/seed/course-flutter/640/360',
        is_recommended: false,
        content: '一套代码同时运行在 iOS 与 Android，涵盖状态管理与原生桥接。',
        like_count: 45,
        chapter_count: 0,
        created_at: now,
        updated_at: now
      },
      {
        category_id: 4,
        user_id: 2,
        name: '大模型应用开发入门',
        image: 'https://picsum.photos/seed/course-llm/640/360',
        is_recommended: true,
        content: 'Prompt 工程、Function Calling 到 RAG，快速上手大模型应用开发。',
        like_count: 320,
        chapter_count: 0,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('courses', null, {});
  }
};
