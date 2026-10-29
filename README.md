## 目录结构

```
.
├─ docs/
│  └─ api.md                     # 接口文档
├─ sql/
│  └─ schema.sql                 # 参考 SQL（实际建表以迁移为准）
├─ http/
│  ├─ articles.http              # 文章接口调试请求
│  ├─ attachments.http           # 附件管理接口调试请求
│  ├─ categories.http            # 分类接口调试请求
│  ├─ chapters.http              # 章节接口调试请求
│  ├─ courses.http               # 课程接口调试请求
│  ├─ settings.http              # 站点设置接口调试请求
│  ├─ uploads.http               # 阿里云 OSS 上传接口调试请求
│  ├─ users.http                 # 用户接口调试请求
│  └─ web.http                   # 前台接口调试请求（认证 / 文章 / 章节 / 系统信息 / 点赞）
├─ src/
│  ├─ app.js                     # Express 应用与错误处理
│  ├─ server.js                  # 启动入口：连接数据库、监听端口
│  ├─ config/
│  │  ├─ config.js               # 数据库配置（CLI 与运行时共用）
│  │  ├─ database.js             # Sequelize 实例
│  │  └─ oss.js                  # 阿里云 OSS 客户端、直传签名、访问地址与上传大小限制
│  ├─ migrations/
│  │  ├─ 20261026000000-create-articles.js
│  │  ├─ 20261027000000-create-settings.js
│  │  ├─ 20261027020000-create-users.js
│  │  ├─ 20261027030000-create-categories.js
│  │  ├─ 20261027030001-create-courses.js
│  │  ├─ 20261027040000-create-likes.js
│  │  ├─ 20261027050000-create-chapters.js
│  │  ├─ 20261027060000-sync-course-chapter-count.js
│  │  ├─ 20261027070000-create-attachments.js
│  │  ├─ 20261028000000-split-users-into-sys-and-app.js
│  │  └─ 20261028010000-remove-admin-from-app-users.js
│  ├─ seeders/
│  │  ├─ 20261026000001-demo-articles.js
│  │  ├─ 20261027000001-default-settings.js
│  │  ├─ 20261027020001-demo-users.js
│  │  ├─ 20261027030002-demo-categories.js
│  │  ├─ 20261027030003-demo-courses.js
│  │  └─ 20261027050002-demo-chapters.js
│  ├─ models/
│  │  ├─ index.js                # 模型汇总与关联关系
│  │  ├─ article.js              # 文章模型
│  │  ├─ attachment.js           # 附件模型
│  │  ├─ category.js             # 分类模型
│  │  ├─ chapter.js              # 课程章节模型
│  │  ├─ course.js               # 课程模型
│  │  ├─ like.js                 # 课程点赞模型
│  │  ├─ setting.js              # 站点设置模型
│  │  ├─ sysUser.js              # 系统用户模型（后台登录）
│  │  ├─ appUser.js              # 前台用户模型（Web 登录）
│  │  └─ userBase.js             # 两类用户的公共字段与密码钩子
│  ├─ controllers/
│  │  ├─ admin/
│  │  │  ├─ article.controller.js   # 后台文章接口逻辑
│  │  │  ├─ attachment.controller.js # 后台附件管理接口逻辑
│  │  │  ├─ category.controller.js  # 后台分类接口逻辑
│  │  │  ├─ chapter.controller.js   # 后台章节接口逻辑
│  │  │  ├─ chart.controller.js     # 后台图表接口逻辑
│  │  │  ├─ course.controller.js    # 后台课程接口逻辑
│  │  │  ├─ setting.controller.js   # 后台站点设置接口逻辑
│  │  │  ├─ upload.controller.js    # 后台 OSS 直传签名与确认接口逻辑
│  │  │  ├─ sysUser.controller.js   # 后台系统用户与登录接口逻辑
│  │  │  └─ appUser.controller.js   # 前台用户管理与课程归属接口逻辑
│  │  └─ web/
│  │     ├─ auth.controller.js      # 前台注册、登录与个人资料
│  │     ├─ article.controller.js   # 前台文章列表与详情
│  │     ├─ chapter.controller.js   # 前台章节列表与详情
│  │     ├─ course.controller.js    # 前台课程列表与详情
│  │     ├─ like.controller.js      # 前台课程点赞
│  │     ├─ category.controller.js  # 前台分类列表
│  │     └─ setting.controller.js   # 前台系统信息
│  ├─ services/
│  │  ├─ article.service.js      # 文章数据访问
│  │  ├─ attachment.service.js   # 附件查询与 OSS 文件删除
│  │  ├─ category.service.js     # 分类数据访问
│  │  ├─ chapter.service.js      # 章节数据访问（含关联查询）
│  │  ├─ chart.service.js        # 图表统计查询
│  │  ├─ course.service.js       # 课程数据访问（含关联查询）
│  │  ├─ like.service.js         # 课程点赞数据访问
│  │  ├─ setting.service.js      # 站点设置数据访问
│  │  ├─ upload.service.js       # OSS 直传签名、确认入库与对象删除
│  │  ├─ sysUser.service.js      # 系统用户数据访问与后台登录
│  │  ├─ appUser.service.js      # 前台用户数据访问、注册、登录与后台管理
│  │  └─ user.helpers.js         # 密码校验、唯一冲突与 JWT 签发
│  ├─ routes/
│  │  ├─ index.js                # /api 路由汇总，按端划分
│  │  ├─ admin/
│  │  │  ├─ index.js             # 后台路由汇总与登录鉴权
│  │  │  ├─ article.routes.js    # 后台文章路由
│  │  │  ├─ attachment.routes.js # 后台附件管理路由
│  │  │  ├─ category.routes.js   # 后台分类路由
│  │  │  ├─ chapter.routes.js    # 后台章节路由
│  │  │  ├─ chart.routes.js      # 后台图表路由
│  │  │  ├─ course.routes.js     # 后台课程路由
│  │  │  ├─ setting.routes.js    # 后台站点设置路由
│  │  │  ├─ upload.routes.js     # 后台 OSS 上传路由
│  │  │  ├─ sysUser.routes.js    # 后台系统用户路由
│  │  │  └─ appUser.routes.js    # 前台用户管理与课程归属路由
│  │  └─ web/
│  │     ├─ index.js             # 前台路由汇总
│  │     ├─ auth.routes.js       # 前台认证路由
│  │     ├─ article.routes.js    # 前台文章路由
│  │     ├─ chapter.routes.js    # 前台章节路由
│  │     ├─ course.routes.js     # 前台课程路由（含点赞别名）
│  │     ├─ category.routes.js   # 前台分类路由
│  │     ├─ like.routes.js       # 前台点赞路由
│  │     └─ setting.routes.js    # 前台系统信息路由
│  ├─ middlewares/
│  │  ├─ auth.middleware.js       # JWT 认证中间件
│  │  ├─ pagination.middleware.js # 分页参数解析中间件
│  │  └─ validate.middleware.js   # zod 参数校验中间件
│  ├─ validators/
│  │  ├─ common.js               # 通用校验片段与查询参数辅助函数
│  │  ├─ article.validator.js    # 文章参数校验
│  │  ├─ attachment.validator.js # 附件参数校验
│  │  ├─ category.validator.js   # 分类参数校验
│  │  ├─ chapter.validator.js    # 章节参数校验
│  │  ├─ chart.validator.js      # 图表参数校验
│  │  ├─ course.validator.js     # 课程参数校验
│  │  ├─ like.validator.js       # 点赞参数校验
│  │  ├─ setting.validator.js    # 站点设置参数校验
│  │  ├─ upload.validator.js     # OSS 上传参数校验
│  │  └─ user.validator.js       # 系统用户 / 前台用户 / 登录参数校验
│  └─ utils/
│     ├─ jwt.js                  # JWT 签发与校验
│     ├─ media.js                # 上传文件的媒体类型识别
│     ├─ password.js             # 密码 bcrypt 哈希与校验
│     └─ response.js             # 统一成功/失败响应与分页响应
├─ .sequelizerc                  # sequelize-cli 路径配置
├─ .env                          # 本地环境变量（已被 git 忽略）
├─ .env.example                  # 环境变量模板
├─ package.json
├─ frontend/                     # 前端应用目录
├─ frontend/admin/               # 后台管理前端（Vite + React + Antd），详见 frontend/admin/README.md
└─ frontend/web/                 # 前台展示站点（Vite + React），详见 frontend/web/README.md
```

## 快速开始

### 2. 安装依赖并初始化数据

```bash
npm install
npm run db:migrate   # 执行迁移，创建全部数据表
npm run db:seed      # 写入示例数据：6 篇文章、站点设置、1 个后台账号 + 2 个前台用户（密码均为 123456）、4 个分类、6 门课程、24 个课程章节

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
- 前台文章列表：<http://localhost:3000/api/articles>
- 前台文章详情：<http://localhost:3000/api/articles/1>
- 前台章节列表：<http://localhost:3000/api/chapters?course_id=1>
- 前台课程列表：<http://localhost:3000/api/courses>
- 前台系统信息：<http://localhost:3000/api/settings>
- 前台注册：`POST http://localhost:3000/api/auth/register`
- 前台登录：`POST http://localhost:3000/api/auth/login`
- 前台点赞：`POST http://localhost:3000/api/likes`（需前台登录态）
- 后台文章列表：<http://localhost:3000/api/admin/articles>
- 后台站点设置：<http://localhost:3000/api/admin/settings>
- 后台用户列表（系统用户）：<http://localhost:3000/api/admin/users>
- 前台用户列表：<http://localhost:3000/api/admin/app-users>（支持新建、编辑、重置密码、删除；名下存在课程时不可删除）
- 后台登录：`POST http://localhost:3000/api/admin/users/login`（校验 `sys_users`）
- 后台章节列表：<http://localhost:3000/api/admin/chapters>
- 后台文件上传：`POST http://localhost:3000/api/admin/uploads/presign`（申请预签名地址，浏览器直传 OSS）→ `POST http://localhost:3000/api/admin/uploads/complete`（确认上传并写入附件表）
- 后台附件管理：<http://localhost:3000/api/admin/attachments>（记录所有上传文件，可删除并同步移除 OSS 对象）

> 文件上传需要先在 `.env` 中配置阿里云 OSS：`OSS_REGION`、`OSS_BUCKET`、`OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET`，其余可选项见 [.env.example](.env.example)。未配置时仅上传接口返回 503，不影响其他接口。Bucket 需要配置允许 `PUT` 和 `Content-Type` 的跨域规则，浏览器才能直传。

> 后台接口统一位于 `/api/admin`，除后台登录外都需要请求头携带 `Authorization: Bearer <token>`，token 通过 `POST /api/admin/users/login` 获取。
>
> 账号拆分为两张表：后台登录与系统用户管理使用 `sys_users`；前台注册、登录、课程归属与点赞使用 `app_users`。两套账号互不影响，管理员账号不会出现在前台用户和课程归属中。
>
> 前台公开接口位于 `/api` 下（文章、章节、分类、课程、系统信息）；个人资料与点赞接口需要前台登录态，token 通过 `POST /api/auth/login` 或 `POST /api/auth/register` 获取。前后台 token 通过 `scope` 隔离，不能互相复用。

## 前端应用

| 应用 | 技术栈 | 开发地址 | 说明 |
| --- | --- | --- | --- |
| `frontend/admin/` | Vite + React + Antd | <http://localhost:5173> | 内容管理后台，登录校验 `sys_users`，对接 `/api/admin`，详见 [frontend/admin/README.md](frontend/admin/README.md) |
| `frontend/web/` | Vite + React（无组件库） | <http://localhost:5174> | 前台展示站点，登录校验 `app_users`，对接 `/api` 前台接口，详见 [frontend/web/README.md](frontend/web/README.md) |

两个前端均通过 Vite 代理把 `/api` 转发到 Express 服务（默认 `http://localhost:3000`，可用 `VITE_PROXY_TARGET` 覆盖），开发时先启动后端再启动前端。

## 参数校验（Zod）

接口的路径参数、查询参数与请求体统一在路由层用 [zod](https://zod.dev/) 校验，schema 放在 `src/validators/`，通过 `src/middlewares/validate.middleware.js` 挂载：

```js
// src/routes/admin/article.routes.js
router.post('/', validate({ body: createArticleBodySchema }), createArticle);
```

- 校验通过后，解析结果挂在 `req.validated`（如 `req.validated.body`、`req.validated.query`），控制器只读取校验后的值。
- zod 默认丢弃 schema 中未声明的字段，因此字段白名单也由 schema 维护，无需在控制器里手写 `pickFields`。
- 查询参数会自动完成类型转换与默认值处理；分页参数 `page` / `pageSize` 不在 schema 中声明，由分页中间件统一处理，见下一节。
- 校验失败统一返回 400，`message` 为 schema 中定义的中文提示，如 `{ "code": 400, "message": "标题不能为空" }`。
- 更新接口使用 `requireAtLeastOneField`，请求体为空或只提交只读字段时返回 400「没有需要更新的字段」。

新增接口时，在对应 `*.validator.js` 中补充 schema，并在路由上挂 `validate({ params, query, body })` 即可。

## 分页（pagination 中间件）

列表接口的分页参数由 `src/middlewares/pagination.middleware.js` 统一解析，路由按接口配置默认值与上限：

```js
// src/routes/web/course.routes.js
router.get(
  '/',
  pagination({ defaultPageSize: 12, maxPageSize: 60 }),
  validate({ query: webListCoursesQuerySchema }),
  listCourses
);
```

- `page` 默认 1；`pageSize` 默认 10、上限 100，两者必须是正整数，非法值返回 400。
- 解析结果挂在 `req.pagination`，包含 `page`、`pageSize`、`offset`、`limit`，控制器把 `offset` / `limit` 传给 service。
- 响应统一用 `successPage(res, { list, total }, req.pagination)` 生成 `list` 与 `pagination`，其中 `totalPages` 由 `total / pageSize` 向上取整得到。

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
