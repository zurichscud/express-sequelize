## 目录结构

```
.
├─ docs/
│  └─ api.md                     # 接口文档
├─ sql/
│  └─ schema.sql                 # 参考 SQL（实际建表以迁移为准）
├─ http/
│  ├─ articles.http              # 文章接口调试请求
│  ├─ categories.http            # 分类接口调试请求
│  ├─ courses.http               # 课程接口调试请求
│  ├─ settings.http              # 站点设置接口调试请求
│  └─ users.http                 # 用户接口调试请求
├─ src/
│  ├─ app.js                     # Express 应用与错误处理
│  ├─ server.js                  # 启动入口：连接数据库、监听端口
│  ├─ config/
│  │  ├─ config.js               # 数据库配置（CLI 与运行时共用）
│  │  └─ database.js             # Sequelize 实例
│  ├─ migrations/
│  │  ├─ 20261026000000-create-articles.js
│  │  ├─ 20261027000000-create-settings.js
│  │  ├─ 20261027020000-create-users.js
│  │  ├─ 20261027030000-create-categories.js
│  │  └─ 20261027030001-create-courses.js
│  ├─ seeders/
│  │  ├─ 20261026000001-demo-articles.js
│  │  ├─ 20261027000001-default-settings.js
│  │  ├─ 20261027020001-demo-users.js
│  │  ├─ 20261027030002-demo-categories.js
│  │  └─ 20261027030003-demo-courses.js
│  ├─ models/
│  │  ├─ index.js                # 模型汇总与关联关系
│  │  ├─ article.model.js        # 文章模型
│  │  ├─ category.model.js       # 分类模型
│  │  ├─ course.model.js         # 课程模型
│  │  ├─ setting.model.js        # 站点设置模型
│  │  └─ user.model.js           # 用户模型
│  ├─ controllers/
│  │  ├─ article.controller.js   # 文章接口逻辑
│  │  ├─ category.controller.js  # 分类接口逻辑
│  │  ├─ course.controller.js    # 课程接口逻辑
│  │  ├─ setting.controller.js   # 站点设置接口逻辑
│  │  └─ user.controller.js      # 用户接口逻辑
│  ├─ services/
│  │  ├─ article.service.js      # 文章数据访问
│  │  ├─ category.service.js     # 分类数据访问
│  │  ├─ course.service.js       # 课程数据访问（含关联查询）
│  │  ├─ setting.service.js      # 站点设置数据访问
│  │  └─ user.service.js         # 用户数据访问
│  ├─ routes/
│  │  ├─ article.routes.js       # 文章路由
│  │  ├─ category.routes.js      # 分类路由
│  │  ├─ course.routes.js        # 课程路由
│  │  ├─ setting.routes.js       # 站点设置路由
│  │  └─ user.routes.js          # 用户路由
│  └─ utils/
│     ├─ password.js             # 密码 bcrypt 哈希与校验
│     └─ response.js             # 统一成功/失败响应
├─ .sequelizerc                  # sequelize-cli 路径配置
├─ .env                          # 本地环境变量（已被 git 忽略）
├─ .env.example                  # 环境变量模板
└─ package.json
```

## 快速开始

### 2. 安装依赖并初始化数据

```bash
npm install
npm run db:migrate   # 执行迁移，创建全部数据表
npm run db:seed      # 写入示例数据：6 篇文章、站点设置、3 个用户（密码均为 123456）、4 个分类、6 门课程

# 也可以一条命令完成迁移 + 种子数据
npm run seed
```

### 3. 启动服务

```bash
npm run dev      # node --watch，修改代码自动重启
# 或
npm start
```

启动成功后访问：

- 健康检查：<http://localhost:3000/health>
- 文章列表：<http://localhost:3000/api/articles>
- 文章详情：<http://localhost:3000/api/articles/1>
- 站点设置：<http://localhost:3000/api/settings>
- 用户列表：<http://localhost:3000/api/users>
- 分类列表：<http://localhost:3000/api/categories>
- 课程列表：<http://localhost:3000/api/courses>

## 数据库迁移

数据库结构由 `src/migrations` 下的迁移文件管理，执行记录保存在 `SequelizeMeta` 表；示例数据由 `src/seeders` 管理，记录保存在 `SequelizeData` 表。服务启动时只校验连接，不再调用 `sequelize.sync()`。

```bash
# 新增迁移（生成到 src/migrations）
npx sequelize-cli migration:generate --name add-published-at-to-articles

# 执行 / 回滚迁移
npm run db:migrate
npm run db:migrate:undo

# 执行 / 回滚 seeder
npm run db:seed
npm run db:seed:undo
```

> 全新数据库直接执行 `npm run db:migrate && npm run db:seed` 即可。如果是在已有 `articles` 表的数据库上首次引入迁移，需要先 baseline 初始迁移（把迁移文件名写入 `SequelizeMeta`），避免重复建表。
>
> 回滚时建议先执行 `npm run db:seed:undo`，再执行 `npm run db:migrate:undo`，避免重新迁移后 seeder 记录仍在、示例数据不会再次写入。

## 接口文档

全部接口的参数、示例与错误响应见 [docs/api.md](docs/api.md)。

## 数据表

各表字段、索引与外键说明见参考 SQL：[sql/schema.sql](sql/schema.sql)（实际建表以迁移为准）。

## 常用命令

| 命令                      | 说明                  |
| ------------------------- | --------------------- |
| `npm run dev`             | 开发模式（自动重启）  |
| `npm start`               | 生产模式启动          |
| `npm run db:migrate`      | 执行所有待执行迁移    |
| `npm run db:migrate:undo` | 回滚最近一次迁移      |
| `npm run db:seed`         | 执行所有待执行 seeder |
| `npm run db:seed:undo`    | 回滚所有 seeder       |
| `npm run seed`            | 迁移 + seeder         |
