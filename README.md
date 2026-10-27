# Express + Sequelize + MySQL

一个基于 **Express 5 + Sequelize 6 + MySQL 8** 的示例项目，包含 `articles` 文章表、`settings` 站点设置表（单记录）、`users` 用户表、`categories` 分类表和 `courses` 课程表（外键关联分类与用户），以及对应的 CRUD 接口和 sequelize-cli 数据库迁移和 seeder。

## 技术栈

| 依赖          | 版本  | 用途                 |
| ------------- | ----- | -------------------- |
| Express       | ^5.3  | HTTP 服务            |
| Sequelize     | ^6.37 | ORM                  |
| mysql2        | ^3.24 | MySQL 驱动           |
| dotenv        | ^18   | 读取 `.env` 环境变量 |
| sequelize-cli | ^6.6  | 迁移与 seeder（dev） |

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

## 数据表 articles

| 字段       | 类型                             | 说明                   |
| ---------- | -------------------------------- | ---------------------- |
| id         | INT UNSIGNED, PK, AUTO_INCREMENT | 主键                   |
| title      | VARCHAR(200), NOT NULL           | 标题                   |
| summary    | VARCHAR(500), NULL               | 摘要                   |
| content    | TEXT, NOT NULL                   | 正文                   |
| author     | VARCHAR(64), NOT NULL            | 作者，默认“匿名”       |
| status     | ENUM('draft','published')        | 状态，默认 `published` |
| views      | INT UNSIGNED, NOT NULL           | 浏览量，默认 0         |
| created_at | DATETIME, NOT NULL               | 创建时间               |
| updated_at | DATETIME, NOT NULL               | 更新时间               |

索引：`idx_articles_status_created(status, created_at)`、`idx_articles_title(title)`。

## 数据表 settings

站点设置表，业务上仅一条记录（由 seeder 写入或首次查询自动初始化）。

| 字段       | 类型                             | 说明       |
| ---------- | -------------------------------- | ---------- |
| id         | INT UNSIGNED, PK, AUTO_INCREMENT | 主键       |
| name       | VARCHAR(100), NOT NULL           | 站点名称   |
| icp        | VARCHAR(64), NULL                | ICP 备案号 |
| copyright  | VARCHAR(200), NULL               | 版权信息   |
| created_at | DATETIME, NOT NULL               | 创建时间   |
| updated_at | DATETIME, NOT NULL               | 更新时间   |

## 数据表 users

| 字段       | 类型                             | 说明                  |
| ---------- | -------------------------------- | --------------------- |
| id         | INT UNSIGNED, PK, AUTO_INCREMENT | 主键                  |
| email      | VARCHAR(128), NOT NULL, UNIQUE   | 邮箱，登录凭证        |
| password   | VARCHAR(255), NOT NULL           | 密码，bcrypt 哈希存储 |
| username   | VARCHAR(64), NOT NULL, UNIQUE    | 用户名                |
| nickname   | VARCHAR(64), NULL                | 昵称                  |
| sex        | ENUM('unknown','male','female')  | 性别，默认 `unknown`  |
| role       | ENUM('user','admin')             | 角色，默认 `user`     |
| created_at | DATETIME, NOT NULL               | 创建时间              |
| updated_at | DATETIME, NOT NULL               | 更新时间              |

## 数据表 categories

| 字段       | 类型                             | 说明                         |
| ---------- | -------------------------------- | ---------------------------- |
| id         | INT UNSIGNED, PK, AUTO_INCREMENT | 主键                         |
| name       | VARCHAR(64), NOT NULL, UNIQUE    | 分类名称                     |
| rank       | INT, NOT NULL                    | 排序序号，越小越靠前，默认 0 |
| created_at | DATETIME, NOT NULL               | 创建时间                     |
| updated_at | DATETIME, NOT NULL               | 更新时间                     |

## 数据表 courses

| 字段           | 类型                             | 说明                                  |
| -------------- | -------------------------------- | ------------------------------------- |
| id             | INT UNSIGNED, PK, AUTO_INCREMENT | 主键                                  |
| category_id    | INT UNSIGNED, NOT NULL, FK       | 分类 ID，外键关联 categories          |
| user_id        | INT UNSIGNED, NOT NULL, FK       | 所属用户 ID（创建者），外键关联 users |
| name           | VARCHAR(128), NOT NULL           | 课程名称                              |
| image          | VARCHAR(500), NULL               | 封面图片地址                          |
| is_recommended | TINYINT(1), NOT NULL             | 是否推荐，默认 false                  |
| content        | TEXT, NULL                       | 课程内容                              |
| like_count     | INT UNSIGNED, NOT NULL           | 点赞数，默认 0                        |
| chapter_count  | INT UNSIGNED, NOT NULL           | 章节总数，默认 0                      |
| created_at     | DATETIME, NOT NULL               | 创建时间                              |
| updated_at     | DATETIME, NOT NULL               | 更新时间                              |

索引：`idx_courses_category_id`、`idx_courses_user_id`、`idx_courses_recommended_created(is_recommended, created_at)`。

外键：`category_id` → `categories.id`、`user_id` → `users.id`，均为 `ON DELETE RESTRICT ON UPDATE CASCADE`，删除被引用的记录前需先处理课程（接口层已做友好拦截）。

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
