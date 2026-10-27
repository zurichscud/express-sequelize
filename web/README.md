# Web 前台（web）

基于 **Vite + React + TypeScript** 的前台展示站点，已对接仓库根目录 Express 服务的前台公开接口（`/api` 下）与前台认证、点赞接口。无 UI 组件库依赖，样式为手写 CSS，走「纸质杂志 + 中式书卷」编辑风。

## 技术栈

| 依赖 | 版本 | 说明 |
| --- | --- | --- |
| Vite | 8.x | 开发服务器与构建 |
| React | 19.x | 视图层 |
| TypeScript | 6.x | 类型约束 |
| React Router | 7.x | 路由（懒加载页面） |
| Axios | 1.x | 请求封装 |
| Day.js | 1.x | 日期格式化 |

## 快速开始

先启动根目录的后端（默认 `http://localhost:3000`）：

```bash
# 在仓库根目录
npm run dev
```

再启动前台：

```bash
cd web
npm install
npm run dev
```

打开 <http://localhost:5174>。登录 / 注册走 `POST /api/auth/login` 与 `POST /api/auth/register`，
成功后把后端签发的 `scope=web` JWT 保存到 `localStorage`，后续点赞、个人资料接口自动携带。
演示账号（与后端种子数据一致）：

```text
账号：zhangsan@example.com
密码：123456
```

## 页面

| 路由 | 说明 |
| --- | --- |
| `/` | 首页：Hero、精选课程、分类索引、最新文章、学习方法 |
| `/courses` | 课程目录：分类筛选、关键词搜索、分页 |
| `/courses/:id` | 课程详情：简介、章节目录 + 章节正文 / 视频、点赞、同类课程 |
| `/articles` | 实践笔记：最新发布 / 阅读最多排序、关键词搜索、分页 |
| `/articles/:id` | 文章详情：阅读进度条、首字下沉排版、浏览量 +1 |
| `/me/likes` | 我的点赞（需登录） |
| `/me` | 账号设置：修改昵称 / 性别 / 密码（需登录） |
| `*` | 404 |

站点名称、备案号、版权信息从 `GET /api/settings` 读取；未登录访问 `/me/*` 时展示登录引导，不强制跳转。

## 环境变量

复制 `.env.example` 为 `.env`（当前仓库未提供示例文件时可直接新建）：

```bash
VITE_API_BASE_URL=/api
VITE_PROXY_TARGET=http://localhost:3000
```

- `VITE_API_BASE_URL`：浏览器请求前缀，生产环境可改为完整接口地址
- `VITE_PROXY_TARGET`：仅开发环境使用，Vite 将 `/api` 代理到该地址，避免跨域

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 开发模式（<http://localhost:5174>） |
| `npm run build` | 类型检查 + 生产构建（产物在 `dist/`） |
| `npm run preview` | 预览构建产物（<http://localhost:4174>） |
| `npm run lint` | oxlint 检查 |
