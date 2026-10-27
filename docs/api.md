# 接口说明

基础地址：`http://localhost:3000`。所有接口返回统一 JSON 结构：`{ "code": 0, "message": "ok", "data": ... }`，出错时 `code` 为对应状态码。也可直接使用 `http/` 目录下的 `.http` 文件在 VS Code REST Client 中调试。

## 文章

### GET /api/articles

分页查询文章列表，按创建时间倒序。

| 参数     | 类型   | 必填 | 默认值 | 说明                   |
| -------- | ------ | ---- | ------ | ---------------------- |
| page     | number | 否   | 1      | 页码，最小 1           |
| pageSize | number | 否   | 10     | 每页条数，1~100        |
| keyword  | string | 否   | —      | 标题 / 摘要模糊搜索    |
| status   | string | 否   | —      | `draft` 或 `published` |

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

| 参数 | 类型   | 必填 | 说明            |
| ---- | ------ | ---- | --------------- |
| id   | number | 是   | 文章 ID，正整数 |

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

| 状态码 | 场景                 | 响应体                                       |
| ------ | -------------------- | -------------------------------------------- |
| 400    | `id` 不是正整数      | `{ "code": 400, "message": "文章 ID 无效" }` |
| 404    | 对应 ID 的文章不存在 | `{ "code": 404, "message": "文章不存在" }`   |

## 站点设置

### GET /api/settings

查询站点设置。表中仅一条记录，记录不存在时自动初始化默认记录，始终有数据返回。

### PUT /api/settings

更新站点设置（仅更新请求体中提供的字段，`icp`/`copyright` 传空字符串可清空）。

```bash
curl -X PUT "http://localhost:3000/api/settings" \
  -H "Content-Type: application/json" \
  -d '{ "name": "我的网站", "icp": "粤ICP备12345678号", "copyright": "© 2026 我的网站 版权所有" }'
```

| 字段      | 类型   | 必填 | 说明                   |
| --------- | ------ | ---- | ---------------------- |
| name      | string | 否   | 站点名称，最长 100 字  |
| icp       | string | 否   | ICP 备案号，最长 64 字 |
| copyright | string | 否   | 版权信息，最长 200 字  |

错误响应：空请求体返回 `{ "code": 400, "message": "没有需要更新的字段" }`，字段校验失败返回对应中文提示。

## 用户

### GET /api/users

分页查询用户列表，按创建时间倒序，响应中不包含密码。

| 参数     | 类型   | 必填 | 默认值 | 说明                          |
| -------- | ------ | ---- | ------ | ----------------------------- |
| page     | number | 否   | 1      | 页码，最小 1                  |
| pageSize | number | 否   | 10     | 每页条数，1~100               |
| keyword  | string | 否   | —      | 邮箱 / 用户名 / 昵称模糊搜索  |
| sex      | string | 否   | —      | `unknown` / `male` / `female` |
| role     | string | 否   | —      | `user` 或 `admin`             |

### POST /api/users

创建用户。`email` 与 `username` 唯一，重复时返回 400「邮箱已被注册 / 用户名已存在」；`password` 为明文，存储时自动 bcrypt 哈希，接口响应永不返回密码。

| 字段     | 类型   | 必填 | 默认值  | 说明                                      |
| -------- | ------ | ---- | ------- | ----------------------------------------- |
| email    | string | 是   | —       | 邮箱，唯一，最长 128 字                   |
| password | string | 是   | —       | 明文密码，6-72 位                         |
| username | string | 是   | —       | 用户名，唯一，仅限字母/数字/下划线/短横线 |
| nickname | string | 否   | null    | 昵称，最长 64 字                          |
| sex      | string | 否   | unknown | `unknown` / `male` / `female`             |
| role     | string | 否   | user    | `user` / `admin`                          |

### GET /api/users/:id

查询单个用户详情（不包含密码）。不存在时返回 404「用户不存在」。

### PUT /api/users/:id

更新用户，仅更新请求体中提供的字段。传 `password` 时自动重新哈希（明文格式校验同创建）。空请求体返回 400「没有需要更新的字段」。

### DELETE /api/users/:id

删除单个用户。不存在时返回 404「用户不存在」；名下还有课程时返回 400「该用户名下还有 N 门课程，无法删除」。

## 分类

### GET /api/categories

查询分类列表，按 `rank` 升序排列（分类数量有限，不分页）。

### POST /api/categories

创建分类。`name` 必填且唯一（重复返回 400「分类名称已存在」），`rank` 选填默认 0，越小越靠前。

### GET /api/categories/:id

查询单个分类详情。不存在时返回 404「分类不存在」。

### PUT /api/categories/:id

更新分类，仅更新请求体中提供的字段（`name` / `rank`）。

### DELETE /api/categories/:id

删除分类。分类下还有课程时返回 400「该分类下还有 N 门课程，无法删除」。

## 课程

### GET /api/courses

分页查询课程列表，按创建时间倒序，每条课程内嵌 `category`（id/name/rank）与 `user`（id/username/nickname），不返回 `content` 正文。

| 参数           | 类型   | 必填 | 默认值 | 说明             |
| -------------- | ------ | ---- | ------ | ---------------- |
| page           | number | 否   | 1      | 页码，最小 1     |
| pageSize       | number | 否   | 10     | 每页条数，1~100  |
| category_id    | number | 否   | —      | 按分类筛选       |
| user_id        | number | 否   | —      | 按所属用户筛选   |
| is_recommended | string | 否   | —      | `true` / `false` |
| keyword        | string | 否   | —      | 课程名称模糊搜索 |

### POST /api/courses

创建课程。`category_id`、`user_id` 必填且必须存在（不存在返回 400「分类不存在 / 用户不存在」）；`name` 必填；`is_recommended` 默认 `false`；`like_count` / `chapter_count` 默认 0。

### GET /api/courses/:id

查询单个课程详情（含 `content` 正文与关联的分类、用户信息）。

### PUT /api/courses/:id

更新课程，仅更新请求体中提供的字段。可变更 `category_id`（需存在）；`user_id` 创建后不可变更。

### DELETE /api/courses/:id

删除单个课程。不存在时返回 404「课程不存在」。

## 图表

### GET /api/charts/gender

统计用户性别分布，无查询参数。按 `unknown` / `male` / `female` 固定顺序返回各性别的数量与占比（占比保留两位小数），未出现过的性别也返回 0，保证图表数据结构稳定。

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "total": 42,
    "list": [
      { "sex": "unknown", "count": 12, "percent": 28.57 },
      { "sex": "male", "count": 18, "percent": 42.86 },
      { "sex": "female", "count": 12, "percent": 28.57 }
    ]
  }
}
```

### GET /api/charts/monthly-users

统计每个月的用户注册数量，按月份升序返回。没有用户的月份补 `0`，保证 x 轴连续。

| 参数 | 类型   | 必填 | 默认值 | 说明                                                       |
| ---- | ------ | ---- | ------ | ---------------------------------------------------------- |
| year | number | 否   | —      | 四位年份（1970~2100）。传了只返回该年 1-12 月，不传则返回有数据以来的所有月份 |

非法 `year`（非四位数字或超出范围）返回 400「year 参数无效，需为 1970-2100 之间的四位年份」。

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "year": null,
    "total": 3,
    "list": [
      { "month": "2026-09", "count": 1 },
      { "month": "2026-10", "count": 2 }
    ]
  }
}
```

`data.year` 为传参的年份，未传时为 `null`；`data.total` 为统计范围内用户总数。
