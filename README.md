# Express + Sequelize + MySQL

一个基于 **Express 5 + Sequelize 6 + MySQL 8** 的示例项目，包含一张 `articles` 文章表、分页列表/单篇详情接口，以及 sequelize-cli 数据库迁移和 seeder。

## 技术栈

| 依赖      | 版本   | 用途                    |
| --------- | ------ | ----------------------- |
| Express   | ^5.3   | HTTP 服务               |
| Sequelize | ^6.37  | ORM                     |
| mysql2    | ^3.24  | MySQL 驱动              |
| dotenv    | ^18    | 读取 `.env` 环境变量    |
| sequelize-cli | ^6.6 | 迁移与 seeder（dev） |

## 目录结构

```
.
├─ sql/
│  └─ schema.sql                 # 参考 SQL（实际建表以迁移为准）
├─ src/
│  ├─ app.js                     # Express 应用与错误处理
│  ├─ server.js                  # 启动入口：连接数据库、监听端口
│  ├─ config/
│  │  ├─ config.js               # 数据库配置（CLI 与运行时共用）
│  │  └─ database.js             # Sequelize 实例
│  ├─ migrations/
│  │  └─ 20261026000000-create-articles.js
│  ├─ seeders/
│  │  └─ 20261026000001-demo-articles.js
│  ├─ models/
│  │  ├─ index.js                # 模型汇总
│  │  └─ article.model.js        # 文章模型
│  ├─ controllers/
│  │  └─ article.controller.js   # 文章列表与详情逻辑
│  └─ routes/
│     └─ article.routes.js       # 文章路由
├─ .sequelizerc                  # sequelize-cli 路径配置
├─ .env                          # 本地环境变量（已被 git 忽略）
├─ .env.example                  # 环境变量模板
└─ package.json
```

## 快速开始

### 1. 启动 WSL 中的 MySQL

当前机器的 `3306` 端口已被 Windows 的 MySQL91 服务占用，因此把 WSL 中的 MySQL 容器映射到 **3307**。Docker Hub 直连会超时，这里使用国内镜像源 `docker.m.daocloud.io`：

```bash
wsl -d Ubuntu

docker pull docker.m.daocloud.io/library/mysql:8.4

docker run -d --name mysql-dev \
  --restart unless-stopped \
  -e MYSQL_ROOT_PASSWORD=root123456 \
  -e MYSQL_DATABASE=express_sequelize \
  -e MYSQL_USER=app \
  -e MYSQL_PASSWORD=app123456 \
  -p 3307:3306 \
  docker.m.daocloud.io/library/mysql:8.4
```

> 也可以换用 `docker.1ms.run/library/mysql:8.4`。如果本机 Docker 已配置 `registry-mirrors`，直接写 `mysql:8.4` 也会自动走加速源。
>
> 如果你的 3306 端口空闲，也可以使用 `-p 3306:3306`，同时把 `.env` 里的 `DB_PORT` 改成 `3306`。

等待容器就绪：

```bash
docker exec mysql-dev mysqladmin ping -uroot -proot123456
# 输出 mysqld is alive 即可
```

### 2. 安装依赖并初始化数据

```bash
npm install
npm run db:migrate   # 执行迁移，创建 articles 表
npm run db:seed      # 写入 6 条示例文章

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

## 接口说明

### GET /api/articles

分页查询文章列表，按创建时间倒序。

| 参数     | 类型   | 必填 | 默认值 | 说明                              |
| -------- | ------ | ---- | ------ | --------------------------------- |
| page     | number | 否   | 1      | 页码，最小 1                      |
| pageSize | number | 否   | 10     | 每页条数，1~100                   |
| keyword  | string | 否   | —      | 标题 / 摘要模糊搜索               |
| status   | string | 否   | —      | `draft` 或 `published`            |

请求示例：

```bash
curl "http://localhost:3000/api/articles?page=1&pageSize=2&keyword=Sequelize"
```

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [
      {
        "id": 2,
        "title": "Sequelize 模型定义与关联关系入门",
        "summary": "用数据模型描述表结构，并处理一对多、多对多关联。",
        "author": "李四",
        "status": "published",
        "views": 96,
        "createdAt": "2026-10-26T14:00:00.000Z",
        "updatedAt": "2026-10-26T14:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 2,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

> 列表接口不返回 `content` 正文字段，避免一次传输过多数据。

### GET /api/articles/:id

查询单篇文章详情，返回包含 `content` 正文在内的完整字段。

| 参数 | 类型   | 必填 | 说明              |
| ---- | ------ | ---- | ----------------- |
| id   | number | 是   | 文章 ID，正整数   |

请求示例：

```bash
curl "http://localhost:3000/api/articles/1"
```

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": 1,
    "title": "深入理解 Express 中间件",
    "summary": "中间件是 Express 的核心，本文从执行顺序讲到错误处理。",
    "content": "Express 应用本质上是一条中间件流水线……",
    "author": "张三",
    "status": "published",
    "views": 128,
    "createdAt": "2026-10-26T14:00:00.000Z",
    "updatedAt": "2026-10-26T14:00:00.000Z"
  }
}
```

错误响应：

| 状态码 | 场景                       | 响应体                                    |
| ------ | -------------------------- | ----------------------------------------- |
| 400    | `id` 不是正整数            | `{ "code": 400, "message": "文章 ID 无效" }` |
| 404    | 对应 ID 的文章不存在       | `{ "code": 404, "message": "文章不存在" }`   |

## 数据表 articles

| 字段       | 类型                          | 说明                        |
| ---------- | ----------------------------- | --------------------------- |
| id         | INT UNSIGNED, PK, AUTO_INCREMENT | 主键                     |
| title      | VARCHAR(200), NOT NULL        | 标题                        |
| summary    | VARCHAR(500), NULL            | 摘要                        |
| content    | TEXT, NOT NULL                | 正文                        |
| author     | VARCHAR(64), NOT NULL         | 作者，默认“匿名”            |
| status     | ENUM('draft','published')     | 状态，默认 `published`      |
| views      | INT UNSIGNED, NOT NULL        | 浏览量，默认 0              |
| created_at | DATETIME, NOT NULL            | 创建时间                    |
| updated_at | DATETIME, NOT NULL            | 更新时间                    |

索引：`idx_articles_status_created(status, created_at)`、`idx_articles_title(title)`。

## 常用命令

| 命令                      | 说明                     |
| ------------------------- | ------------------------ |
| `npm run dev`             | 开发模式（自动重启）     |
| `npm start`               | 生产模式启动             |
| `npm run db:migrate`      | 执行所有待执行迁移       |
| `npm run db:migrate:undo` | 回滚最近一次迁移         |
| `npm run db:seed`         | 执行所有待执行 seeder    |
| `npm run db:seed:undo`    | 回滚所有 seeder          |
| `npm run seed`            | 迁移 + seeder            |

## 常见问题

### `connect ECONNREFUSED 127.0.0.1:3307`

说明 WSL 已经休眠，MySQL 容器跟着停止，`3307` 端口没有监听。先启动 WSL 并等待 MySQL 就绪：

```powershell
wsl -d Ubuntu

# 在 WSL 里等待容器就绪
docker exec mysql-dev mysqladmin ping -uroot -proot123456
# 输出 mysqld is alive 后再启动项目
```

保持这个 WSL 终端打开，WSL 就不会空闲休眠；也可以在 `C:\Users\lai\.wslconfig` 的 `[wsl2]` 中调大 `vmIdleTimeout`（单位毫秒）。

## 说明

- 数据库结构由迁移文件管理，启动时不再自动 `sync()`；修改模型后请新增迁移并执行 `npm run db:migrate`。
- 连接默认使用 `utf8mb4`，可直接存储 Emoji。
- 时间字段返回 ISO 8601 UTC 格式，前端可用 `new Date(...)` 转成本地时间。
- **WSL 分发在最后一个 `wsl` 会话退出后会自动休眠**，MySQL 容器也会随之停止。运行本项目时请保持一个 Ubuntu 终端（或 `wsl -d Ubuntu` 会话）开启。容器已设置 `--restart unless-stopped`，WSL 下次启动时会自动拉起，首次连接需等待约 20~30 秒。
- Windows 访问 WSL 服务依赖 WSL2 的 `localhostForwarding`（默认开启）。如果 `127.0.0.1:3307` 不通，可在 WSL 执行 `hostname -I` 获取 IP，把 `.env` 的 `DB_HOST` 改成该 IP。
- `.env` 中的密码仅用于本地开发，请勿提交真实生产密码。
