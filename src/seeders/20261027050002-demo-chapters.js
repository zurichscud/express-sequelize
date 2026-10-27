'use strict';

// 演示课程的章节内容。仅当 chapters 表为空时写入，避免覆盖已有数据。
const CHAPTERS = {
  'Vue 3 从入门到实战': [
    {
      title: '第 1 章：环境搭建与项目初始化',
      content: '安装 Node.js 与编辑器，使用 Vite 创建 Vue 3 项目，并认识目录结构与开发脚本。'
    },
    {
      title: '第 2 章：组合式 API 与响应式系统',
      content: '理解 ref、reactive、computed 与 watch 的配合方式，掌握组合式函数的拆分思路。'
    },
    {
      title: '第 3 章：组件通信与路由',
      content: '通过 props、emits 与插槽组织组件，使用 Vue Router 完成页面切换与路由守卫。'
    },
    {
      title: '第 4 章：状态管理 Pinia 与工程化',
      content: '用 Pinia 管理跨页面状态，并补齐环境变量、代码规范与生产构建配置。'
    }
  ],
  'React 18 核心原理与源码解析': [
    {
      title: '第 1 章：React 18 新特性概览',
      content: '从 createRoot 开始，梳理并发渲染、自动批处理与过渡更新等核心变化。'
    },
    {
      title: '第 2 章：Fiber 架构与渲染流程',
      content: '理解 Fiber 节点、双缓存树与工作循环，弄清楚一次更新从触发到提交的完整链路。'
    },
    {
      title: '第 3 章：并发特性与自动批处理',
      content: '通过 startTransition、useDeferredValue 等 API 观察优先级调度对交互体验的影响。'
    },
    {
      title: '第 4 章：Hooks 原理与性能优化',
      content: '分析 Hooks 链表结构，结合 memo、useMemo 与 useCallback 建立可量化的优化思路。'
    }
  ],
  'Node.js 中间件设计模式': [
    {
      title: '第 1 章：中间件流水线模型',
      content: '从 Express 的 next 机制出发，理解请求在中间件栈中的执行顺序与中断方式。'
    },
    {
      title: '第 2 章：错误处理与异常兜底',
      content: '设计统一的错误中间件，区分业务错误与系统异常，并补齐日志记录。'
    },
    {
      title: '第 3 章：JWT 鉴权中间件',
      content: '实现 token 解析、过期处理与角色校验，并说明前后台登录态隔离的必要性。'
    },
    {
      title: '第 4 章：可复用的中间件设计',
      content: '把参数校验、限流与响应封装拆成独立中间件，保持职责单一、组合灵活。'
    }
  ],
  'MySQL 索引优化实战': [
    {
      title: '第 1 章：B+ 树与索引结构',
      content: '理解聚簇索引与二级索引的存储差异，以及为什么范围查询更偏爱有序结构。'
    },
    {
      title: '第 2 章：执行计划分析',
      content: '使用 EXPLAIN 读懂访问类型、候选索引与扫描行数，定位潜在的性能瓶颈。'
    },
    {
      title: '第 3 章：慢查询定位与优化',
      content: '结合慢查询日志与性能模式，从 SQL 改写和索引调整两个方向落地优化。'
    },
    {
      title: '第 4 章：联合索引与覆盖索引',
      content: '掌握最左前缀原则，利用覆盖索引减少回表，并评估索引维护成本。'
    }
  ],
  'Flutter 跨平台移动开发': [
    {
      title: '第 1 章：环境搭建与第一个页面',
      content: '安装 Flutter SDK 与模拟器，创建项目并完成一个可交互的首页。'
    },
    {
      title: '第 2 章：Widget 与布局体系',
      content: '理解组合优于继承的 Widget 设计，熟练使用 Row、Column、Stack 与约束系统。'
    },
    {
      title: '第 3 章：状态管理与数据流',
      content: '对比 setState、Provider 与 Riverpod，选择适合页面规模的状态管理方案。'
    },
    {
      title: '第 4 章：原生能力与平台通道',
      content: '通过 MethodChannel 调用原生能力，并处理权限、生命周期与异常回传。'
    }
  ],
  '大模型应用开发入门': [
    {
      title: '第 1 章：大模型应用开发概览',
      content: '梳理模型调用、上下文管理与应用编排的基本链路，建立整体工程视角。'
    },
    {
      title: '第 2 章：Prompt 工程实践',
      content: '从角色设定、结构化输出到少样本示例，写出稳定可复用的提示词。'
    },
    {
      title: '第 3 章：Function Calling 与工具调用',
      content: '把外部工具注册给模型，处理参数校验、调用结果回填与失败重试。'
    },
    {
      title: '第 4 章：RAG 检索增强生成',
      content: '完成文档切分、向量检索与上下文拼接，并对回答质量做可观测评估。'
    }
  ]
};

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    // 已有章节时跳过，避免覆盖后台录入的数据
    const rows = await queryInterface.sequelize.query('SELECT COUNT(*) AS count FROM `chapters`', {
      type: queryInterface.sequelize.QueryTypes.SELECT
    });
    if (Number(rows[0].count) > 0) {
      return;
    }

    const courses = await queryInterface.sequelize.query('SELECT `id`, `name` FROM `courses`', {
      type: queryInterface.sequelize.QueryTypes.SELECT
    });

    const now = new Date();
    const records = [];
    for (const course of courses) {
      const template = CHAPTERS[course.name];
      if (!template) {
        continue;
      }
      template.forEach((chapter, index) => {
        records.push({
          course_id: course.id,
          title: chapter.title,
          content: chapter.content,
          video_url: null,
          rank: index + 1,
          created_at: now,
          updated_at: now
        });
      });
    }

    if (records.length === 0) {
      return;
    }

    await queryInterface.bulkInsert('chapters', records);
    // chapter_count 由章节接口维护，种子数据写入后同步为实际数量
    for (const course of courses) {
      const total = (CHAPTERS[course.name] || []).length;
      if (total > 0) {
        await queryInterface.bulkUpdate(
          'courses',
          { chapter_count: total, updated_at: now },
          { id: course.id }
        );
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('chapters', null, {});
    await queryInterface.sequelize.query('UPDATE `courses` SET `chapter_count` = 0');
  }
};
