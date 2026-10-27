# 内容管理后台（admin-web）

基于 **Vite + React + TypeScript + Ant Design** 的后台管理系统前端，已对接仓库根目录的 Express + Sequelize 接口。

## 技术栈

| 依赖 | 版本 | 说明 |
| --- | --- | --- |
| Vite | 8.x | 开发服务器与构建 |
| React | 19.x | 视图层 |
| TypeScript | 6.x | 类型约束 |
| Ant Design | 6.x | UI 组件库 |
| React Router | 7.x | 路由与登录守卫 |
| Axios | 1.x | 请求封装 |

## 快速开始

先启动根目录的后端（默认 `http://localhost:3000`）：

```bash
# 在仓库根目录
npm run dev
```

再启动前端：

```bash
cd admin-web
npm install
npm run dev
```

打开 <http://localhost:5173>，演示账号（与后端种子数据一致）：

```text
账号：admin
密码：123456
```

> 登录调用 `POST /api/admin/users/login`，成功后把后端签发的 JWT 保存到
> `localStorage`；`src/api/request.ts` 会自动在请求头携带 `Authorization: Bearer <token>`，
> 遇到 401 时清理登录态并跳回登录页。

## 已实现功能

- **仪表盘**：文章 / 用户 / 课程 / 分类总数、近 12 个月用户增长、性别分布、最新文章
- **文章管理**：分页列表、关键词与状态筛选、新建、编辑（含正文回填）、删除
- **分类管理**：列表、新建、编辑、删除，按排序序号展示
- **课程管理**：分页列表、分类 / 推荐状态筛选、新建、编辑、删除、列表内切换推荐；课程封面支持上传到阿里云 OSS；章节总数由章节接口自动统计，不在课程表单中手工填写
- **课程章节**：在课程行打开章节抽屉，按课程分页查看、搜索、新建、编辑、删除章节，维护排序与视频地址；章节视频支持上传到阿里云 OSS
- **附件管理**：查看所有上传到 OSS 的图片与视频，支持关键词 / 类型筛选、图片视频预览、复制地址、删除附件（同步删除 OSS 文件）
- **用户管理**：分页列表、关键词 / 角色 / 性别筛选、新建、编辑、删除
- **系统设置**：站点名称、ICP 备案号、版权信息
- **通用能力**：统一请求层与错误提示、路由懒加载、登录守卫、明暗主题切换、响应式栅格

## 目录结构

```text
admin-web/
├─ src/
│  ├─ api/                 # 接口模块（axios 封装 + 各业务接口）
│  ├─ components/          # PageContainer、PageLoading、MediaUpload 等通用组件
│  ├─ layouts/             # AdminLayout（侧边栏 + 顶栏 + 内容区）
│  ├─ pages/               # 仪表盘、文章、分类、课程、附件、用户、设置、登录、404
│  ├─ router/              # 路由表与登录守卫
│  ├─ styles/              # 全局样式
│  ├─ theme/               # 明暗主题上下文
│  ├─ types/               # 接口与业务类型
│  └─ utils/               # 请求反馈、鉴权、日期格式化
├─ .env.development        # 开发环境变量
├─ .env.production         # 生产环境变量
└─ vite.config.ts          # 别名与 /api 开发代理
```

## 接口对接

| 页面 | 接口 |
| --- | --- |
| 仪表盘 | `GET /api/admin/articles`、`/users`、`/courses`、`/categories`、`/charts/*` |
| 文章管理 | `GET/POST /api/admin/articles`、`GET/PUT/DELETE /api/admin/articles/:id` |
| 分类管理 | `GET/POST /api/admin/categories`、`PUT/DELETE /api/admin/categories/:id` |
| 课程管理 | `GET/POST /api/admin/courses`、`GET/PUT/DELETE /api/admin/courses/:id` |
| 课程章节 | `GET/POST /api/admin/chapters`、`GET/PUT/DELETE /api/admin/chapters/:id` |
| 文件上传 | `POST /api/admin/uploads`（图片 / 视频由后端代理上传到阿里云 OSS） |
| 附件管理 | `GET /api/admin/attachments`、`DELETE /api/admin/attachments/:id` |
| 用户管理 | `GET/POST /api/admin/users`、`PUT/DELETE /api/admin/users/:id` |
| 系统设置 | `GET/PUT /api/admin/settings` |

后端统一返回 `{ code, message, data }`，`src/api/request.ts` 会直接解包 `data`，
`code !== 0` 或 HTTP 异常时统一弹出错误提示。

## 环境变量

`.env.development`：

```dotenv
VITE_API_BASE_URL=/api/admin
VITE_PROXY_TARGET=http://localhost:3000
```

- `VITE_API_BASE_URL`：浏览器请求前缀，生产环境可改为完整接口地址
- `VITE_PROXY_TARGET`：仅开发环境使用，Vite 将 `/api` 代理到该地址，避免跨域

## 构建部署

```bash
npm run build
npm run preview   # 本地预览构建产物
```

构建产物在 `dist/`，部署时把前端静态文件交给 Nginx，并将 `/api` 反向代理到后端：

```nginx
# 视频上传最大 500MB，client_max_body_size 需要不小于 OSS_VIDEO_MAX_SIZE_MB
client_max_body_size 512m;

location / {
  root /path/to/admin-web/dist;
  try_files $uri $uri/ /index.html;
}

location /api/ {
  proxy_pass http://127.0.0.1:3000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  # 大文件上传到 OSS 可能耗时较长，避免 Nginx 提前断开
  proxy_read_timeout 600s;
  proxy_send_timeout 600s;
}
```

`try_files ... /index.html` 是必须的，否则刷新 `/articles` 等前端路由会 404。

## E2E 测试

使用 Playwright（Chromium）覆盖核心业务流程：

```bash
npx playwright install chromium   # 首次运行需要安装浏览器
npm run test:e2e                  # 无头模式运行，自动复用或启动前后端
npm run test:e2e:headed           # 有头模式，便于观察
npm run test:e2e:ui               # Playwright UI 调试
npm run test:e2e:report           # 打开 HTML 报告
```

已覆盖：

- 登录、登录失败提示、未登录拦截、登录后回到原页面、退出登录
- 仪表盘统计与图表、侧边栏导航、未知路由 404
- 文章：关键词/状态筛选、必填校验、新建、编辑回填、删除
- 分类、课程、用户：新建、编辑、删除；课程推荐开关
- 课程章节：新建、编辑、删除，并校验课程 `chapter_count` 自动同步
- 附件管理：列表加载、关键词搜索、类型筛选
- 系统设置保存与刷新后持久化、明暗主题切换与刷新保持
- 每个用例自动校验页面无 `console.error` 与未捕获异常

测试说明：

- 用例连接真实后端，会创建 `E2E_` 前缀的临时数据，并在用例结束后自动清理
- 单 worker 串行执行，避免多个用例同时修改同一份数据
- 默认前端地址 `http://127.0.0.1:5173`、后端 `http://127.0.0.1:3000`
- 可用 `E2E_BASE_URL`、`E2E_API_ORIGIN` 覆盖地址
- 验证生产构建：

```bash
npm run build
npm run preview -- --host 127.0.0.1
E2E_BASE_URL=http://127.0.0.1:4173 npx playwright test
```

> 登录使用真实后端接口 `POST /api/admin/users/login`，E2E 依赖种子账号
> `admin / 123456`，运行前请确认后端已完成迁移与种子初始化。
