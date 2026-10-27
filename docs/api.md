# 接口说明

基础地址：`http://localhost:3000`。所有接口返回统一 JSON 结构：`{ "code": 0, "message": "ok", "data": ... }`，出错时 `code` 为对应状态码。也可直接使用 `http/` 目录下的 `.http` 文件在 VS Code REST Client 中调试。

> 接口分为两端：后台管理端统一挂载在 `/api/admin`（需要后台登录态）；前台接口挂载在 `/api`（公开接口无需登录，个人资料与点赞需要前台登录态）。两套 token 通过 JWT 载荷中的 `scope` 隔离：后台为 `admin`，前台为 `web`，不能混用。

## 认证

除 `GET /health` 与 `POST /api/admin/users/login` 外，所有 `/api/admin` 接口都要求携带登录接口返回的 JWT：

```http
Authorization: Bearer <token>
```

`token` 由 `POST /api/admin/users/login` 签发，默认有效期 7 天。未携带、格式错误、签名不合法或已过期时返回 401：

| 场景             | 响应体                                               |
| ---------------- | ---------------------------------------------------- |
| 未携带 token     | `{ "code": 401, "message": "请先登录" }`             |
| token 已过期     | `{ "code": 401, "message": "登录已过期，请重新登录" }` |
| token 签名不合法 | `{ "code": 401, "message": "登录状态无效，请重新登录" }` |

## 文章

### GET /api/admin/articles

分页查询文章列表，按创建时间倒序。

| 参数     | 类型   | 必填 | 默认值 | 说明                   |
| -------- | ------ | ---- | ------ | ---------------------- |
| page     | number | 否   | 1      | 页码，最小 1           |
| pageSize | number | 否   | 10     | 每页条数，1~100        |
| keyword  | string | 否   | —      | 标题 / 摘要模糊搜索    |
| status   | string | 否   | —      | `draft` 或 `published` |

请求示例：

```bash
curl "http://localhost:3000/api/admin/articles?page=1&pageSize=2&keyword=Sequelize"
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

### GET /api/admin/articles/:id

查询单篇文章详情，返回包含 `content` 正文在内的完整字段。

| 参数 | 类型   | 必填 | 说明            |
| ---- | ------ | ---- | --------------- |
| id   | number | 是   | 文章 ID，正整数 |

请求示例：

```bash
curl "http://localhost:3000/api/admin/articles/1"
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

### GET /api/admin/settings

查询站点设置。表中仅一条记录，记录不存在时自动初始化默认记录，始终有数据返回。

### PUT /api/admin/settings

更新站点设置（仅更新请求体中提供的字段，`icp`/`copyright` 传空字符串可清空）。

```bash
curl -X PUT "http://localhost:3000/api/admin/settings" \
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

### POST /api/admin/users/login

登录并签发 JWT。`account` 支持传邮箱或用户名；登录成功返回的 `token` 需在后续所有 `/api/admin` 接口中通过请求头 `Authorization: Bearer <token>` 携带。

| 字段     | 类型   | 必填 | 说明                                               |
| -------- | ------ | ---- | -------------------------------------------------- |
| account  | string | 是   | 邮箱或用户名（也可改用 `email` / `username` 字段） |
| password | string | 是   | 明文密码                                           |

请求示例：

```bash
curl -X POST "http://localhost:3000/api/admin/users/login" \
  -H "Content-Type: application/json" \
  -d '{ "account": "admin@example.com", "password": "123456" }'
```

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 604800,
    "expiresAt": "2026-11-03T05:00:00.000Z",
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "username": "admin",
      "nickname": "管理员",
      "sex": "male",
      "role": "admin",
      "createdAt": "2026-10-27T05:00:00.000Z",
      "updatedAt": "2026-10-27T05:00:00.000Z"
    }
  }
}
```

`expiresIn` 单位为秒，由环境变量 `JWT_EXPIRES_IN` 控制（默认 `7d`）；签名密钥由 `JWT_SECRET` 提供。

错误响应：

| 状态码 | 场景                 | 响应体                                             |
| ------ | -------------------- | -------------------------------------------------- |
| 400    | 未传账号或密码       | `{ "code": 400, "message": "请输入邮箱或用户名" }` |
| 401    | 账号不存在或密码错误 | `{ "code": 401, "message": "账号或密码错误" }`     |

### GET /api/admin/users

分页查询用户列表，按创建时间倒序，响应中不包含密码。

| 参数     | 类型   | 必填 | 默认值 | 说明                          |
| -------- | ------ | ---- | ------ | ----------------------------- |
| page     | number | 否   | 1      | 页码，最小 1                  |
| pageSize | number | 否   | 10     | 每页条数，1~100               |
| keyword  | string | 否   | —      | 邮箱 / 用户名 / 昵称模糊搜索  |
| sex      | string | 否   | —      | `unknown` / `male` / `female` |
| role     | string | 否   | —      | `user` 或 `admin`             |

### POST /api/admin/users

创建用户。`email` 与 `username` 唯一，重复时返回 400「邮箱已被注册 / 用户名已存在」；`password` 为明文，存储时自动 bcrypt 哈希，接口响应永不返回密码。

| 字段     | 类型   | 必填 | 默认值  | 说明                                      |
| -------- | ------ | ---- | ------- | ----------------------------------------- |
| email    | string | 是   | —       | 邮箱，唯一，最长 128 字                   |
| password | string | 是   | —       | 明文密码，6-72 位                         |
| username | string | 是   | —       | 用户名，唯一，仅限字母/数字/下划线/短横线 |
| nickname | string | 否   | null    | 昵称，最长 64 字                          |
| sex      | string | 否   | unknown | `unknown` / `male` / `female`             |
| role     | string | 否   | user    | `user` / `admin`                          |

### GET /api/admin/users/:id

查询单个用户详情（不包含密码）。不存在时返回 404「用户不存在」。

### PUT /api/admin/users/:id

更新用户，仅更新请求体中提供的字段。传 `password` 时自动重新哈希（明文格式校验同创建）。空请求体返回 400「没有需要更新的字段」。

### DELETE /api/admin/users/:id

删除单个用户。不存在时返回 404「用户不存在」；名下还有课程时返回 400「该用户名下还有 N 门课程，无法删除」。

## 分类

### GET /api/admin/categories

查询分类列表，按 `rank` 升序排列（分类数量有限，不分页）。

### POST /api/admin/categories

创建分类。`name` 必填且唯一（重复返回 400「分类名称已存在」），`rank` 选填默认 0，越小越靠前。

### GET /api/admin/categories/:id

查询单个分类详情。不存在时返回 404「分类不存在」。

### PUT /api/admin/categories/:id

更新分类，仅更新请求体中提供的字段（`name` / `rank`）。

### DELETE /api/admin/categories/:id

删除分类。分类下还有课程时返回 400「该分类下还有 N 门课程，无法删除」。

## 课程

### GET /api/admin/courses

分页查询课程列表，按创建时间倒序，每条课程内嵌 `category`（id/name/rank）与 `user`（id/username/nickname），不返回 `content` 正文。

| 参数           | 类型   | 必填 | 默认值 | 说明             |
| -------------- | ------ | ---- | ------ | ---------------- |
| page           | number | 否   | 1      | 页码，最小 1     |
| pageSize       | number | 否   | 10     | 每页条数，1~100  |
| category_id    | number | 否   | —      | 按分类筛选       |
| user_id        | number | 否   | —      | 按所属用户筛选   |
| is_recommended | string | 否   | —      | `true` / `false` |
| keyword        | string | 否   | —      | 课程名称模糊搜索 |

### POST /api/admin/courses

创建课程。`category_id`、`user_id` 必填且必须存在（不存在返回 400「分类不存在 / 用户不存在」）；`name` 必填；`is_recommended` 默认 `false`；`like_count` 默认 0；`chapter_count` 由章节接口自动维护，创建/更新课程时传入会被忽略。

### GET /api/admin/courses/:id

查询单个课程详情（含 `content` 正文与关联的分类、用户信息）。

### PUT /api/admin/courses/:id

更新课程，仅更新请求体中提供的字段。可变更 `category_id`（需存在）；`user_id` 创建后不可变更；`chapter_count` 由章节接口自动维护，传入会被忽略（若只提交该字段，返回 400「没有需要更新的字段」）。

### DELETE /api/admin/courses/:id

删除单个课程。不存在时返回 404「课程不存在」。

## 章节

章节属于课程，`course_id` 必须对应已存在的课程；删除课程时其下章节会级联删除。章节新增、删除或变更所属课程后，会自动把对应课程的 `chapter_count` 回写为实际章节数。

### GET /api/admin/chapters

分页查询章节列表，按 `rank` 升序、`id` 升序，每条章节内嵌 `course`（id/name），不返回 `content` 正文。

| 参数      | 类型   | 必填 | 默认值 | 说明              |
| --------- | ------ | ---- | ------ | ----------------- |
| page      | number | 否   | 1      | 页码，最小 1      |
| pageSize  | number | 否   | 10     | 每页条数，1~100   |
| course_id | number | 否   | —      | 按所属课程筛选    |
| keyword   | string | 否   | —      | 章节标题模糊搜索  |

### POST /api/admin/chapters

创建章节。`course_id`、`title` 必填，`course_id` 必须存在（不存在返回 400「课程不存在」）；`content`、`video_url` 选填；`rank` 默认 0，越小越靠前。

### GET /api/admin/chapters/:id

查询单个章节详情（含 `content` 正文与所属课程信息）。

### PUT /api/admin/chapters/:id

更新章节，仅更新请求体中提供的字段。可变更 `course_id`（需存在）；`video_url` 传空字符串可清空。

### DELETE /api/admin/chapters/:id

删除单个章节。不存在时返回 404「章节不存在」。

## 文件上传（阿里云 OSS）

后台的课程封面上传、章节视频上传都走该接口。文件先以 `multipart/form-data` 提交到 Express 服务器，再由服务器代理上传到阿里云 OSS，浏览器不直接接触 AccessKey。

每次上传成功后都会写入 `attachments` 附件表，记录上传用户、原始文件名、OSS Key、访问地址、类型、MIME 和大小，可在「附件管理」中统一查看和删除。

### POST /api/admin/uploads

上传单个图片或视频，需要后台登录态。

| 字段 | 类型 | 必填 | 说明                                         |
| ---- | ---- | ---- | -------------------------------------------- |
| file | file | 是   | 图片或视频文件，表单字段名固定为 `file`      |

支持的格式：

| 类型 | 格式                                       | 默认上限 |
| ---- | ------------------------------------------ | -------- |
| 图片 | jpg / jpeg / png / gif / webp / bmp / avif | 10MB     |
| 视频 | mp4 / webm / mov / avi / mkv / mpeg        | 500MB    |

上限可通过 `OSS_IMAGE_MAX_SIZE_MB`、`OSS_VIDEO_MAX_SIZE_MB` 调整；不支持 SVG（避免脚本注入）。

请求示例：

```bash
curl -X POST "http://localhost:3000/api/admin/uploads" \
  -H "Authorization: Bearer <token>" \
  -F "file=@./cover.png"
```

响应示例（HTTP 201）：

```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "cover.png",
    "object_key": "uploads/image/2026/10/6f1c0f0e-3f0f-4f3a-9a4e-8f0d1c2b3a4e.png",
    "url": "https://my-bucket.oss-cn-shenzhen.aliyuncs.com/uploads/image/2026/10/6f1c0f0e-3f0f-4f3a-9a4e-8f0d1c2b3a4e.png",
    "type": "image",
    "mime_type": "image/png",
    "size": 20480,
    "createdAt": "2026-10-27T09:00:00.000Z",
    "updatedAt": "2026-10-27T09:00:00.000Z"
  }
}
```

对象路径为 `<OSS_DIR>/<image|video>/<年>/<月>/<uuid>.<ext>`，`OSS_DIR` 默认 `uploads`。`url` 可直接作为课程 `image` 或章节 `video_url` 使用。

错误响应：

| 状态码 | 场景                         | 响应体                                                       |
| ------ | ---------------------------- | ------------------------------------------------------------ |
| 400    | 未选择文件                   | `{ "code": 400, "message": "请选择要上传的文件" }`           |
| 400    | 文件类型不支持               | `{ "code": 400, "message": "仅支持上传图片（...）或视频（...）文件" }` |
| 401    | 未登录或 token 无效          | `{ "code": 401, "message": "请先登录" }` 等                  |
| 413    | 超过对应类型的大小上限       | `{ "code": 413, "message": "视频不能超过 500MB" }` 等        |
| 502    | OSS 上传失败（权限/网络等）  | `{ "code": 502, "message": "上传到 OSS 失败：..." }`         |
| 503    | OSS 配置缺失                 | `{ "code": 503, "message": "OSS 配置缺失：请先在 .env 中配置 OSS_REGION、..." }` |

服务端配置（`.env`）：

| 变量                    | 必填 | 说明                                                               |
| ----------------------- | ---- | ------------------------------------------------------------------ |
| OSS_REGION              | 是   | 地域，如 `oss-cn-shenzhen`                                         |
| OSS_BUCKET              | 是   | Bucket 名称                                                        |
| OSS_ACCESS_KEY_ID       | 是   | AccessKey ID                                                       |
| OSS_ACCESS_KEY_SECRET   | 是   | AccessKey Secret                                                   |
| OSS_ENDPOINT            | 否   | 自定义 Endpoint，留空默认 `oss-<region>.aliyuncs.com`              |
| OSS_PUBLIC_URL          | 否   | 公开访问域名（CDN / 自定义域名），留空使用 `https://<bucket>.<endpoint>` |
| OSS_DIR                 | 否   | 对象目录前缀，默认 `uploads`                                       |
| OSS_IMAGE_MAX_SIZE_MB   | 否   | 图片大小上限（MB），默认 10                                        |
| OSS_VIDEO_MAX_SIZE_MB   | 否   | 视频大小上限（MB），默认 500                                       |
| OSS_TIMEOUT             | 否   | 上传超时（毫秒），默认 600000                                      |

> 接口返回的 `url` 为公开访问地址，请确保 Bucket 开启了公共读，或通过 `OSS_PUBLIC_URL` 指向已授权的 CDN 域名。

## 附件管理

附件表记录每一次通过上传接口写入 OSS 的文件。删除附件时会先删除 OSS 对象，成功后再删除数据库记录；OSS 删除失败时保留记录，方便重试。

### GET /api/admin/attachments

分页查询附件，按上传时间倒序，返回上传者（`user`，可能为 `null`）信息。

| 参数     | 类型   | 必填 | 默认值 | 说明                                  |
| -------- | ------ | ---- | ------ | ------------------------------------- |
| page     | number | 否   | 1      | 页码，最小 1                          |
| pageSize | number | 否   | 10     | 每页条数，1~100                       |
| keyword  | string | 否   | —      | 文件名 / OSS Key / 地址模糊搜索       |
| type     | string | 否   | —      | `image` 或 `video`，其他值会被忽略    |

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [
      {
        "id": 1,
        "user_id": 1,
        "name": "cover.png",
        "object_key": "uploads/image/2026/10/6f1c0f0e-3f0f-4f3a-9a4e-8f0d1c2b3a4e.png",
        "url": "https://my-bucket.oss-cn-shenzhen.aliyuncs.com/uploads/image/2026/10/6f1c0f0e-3f0f-4f3a-9a4e-8f0d1c2b3a4e.png",
        "type": "image",
        "mime_type": "image/png",
        "size": 20480,
        "createdAt": "2026-10-27T09:00:00.000Z",
        "updatedAt": "2026-10-27T09:00:00.000Z",
        "user": { "id": 1, "username": "admin", "nickname": "管理员" }
      }
    ],
    "pagination": { "page": 1, "pageSize": 10, "total": 1, "totalPages": 1 }
  }
}
```

### DELETE /api/admin/attachments/:id

删除附件，同时删除 OSS 中的对象和数据库记录。

| 状态码 | 场景                           | 响应体                                                     |
| ------ | ------------------------------ | ---------------------------------------------------------- |
| 400    | `id` 不是正整数                | `{ "code": 400, "message": "附件 ID 无效" }`               |
| 404    | 附件不存在                     | `{ "code": 404, "message": "附件不存在" }`                 |
| 502    | OSS 删除失败（权限/网络等）    | `{ "code": 502, "message": "删除 OSS 文件失败：..." }`     |
| 503    | OSS 配置缺失                   | `{ "code": 503, "message": "OSS 配置缺失：..." }`          |

> 删除附件不会自动清理课程 `image` 或章节 `video_url` 中的引用，删除前请在附件管理页面确认该文件没有被使用。

## 图表

### GET /api/admin/charts/gender

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

### GET /api/admin/charts/monthly-users

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

---

# 前台接口

前台接口统一挂载在 `/api` 下，路径不带 `/admin` 前缀。

- 公开接口：文章、章节、分类、课程、站点信息，无需登录。
- 需要前台登录态：`/api/auth/me`、`/api/auth/password`、`/api/likes` 及其别名。
- 前台 token 由 `POST /api/auth/login` 或 `POST /api/auth/register` 签发，载荷中 `scope` 为 `web`，不能用于 `/api/admin` 接口；后台 token 同样不能调用前台登录态接口。

## 前台认证

### POST /api/auth/register

注册普通用户并直接返回前台登录态。`role`、`id` 等字段即使提交也会被忽略。

| 字段     | 类型   | 必填 | 默认值  | 说明                                      |
| -------- | ------ | ---- | ------- | ----------------------------------------- |
| email    | string | 是   | —       | 邮箱，唯一，最长 128 字                   |
| password | string | 是   | —       | 明文密码，6-72 位                         |
| username | string | 是   | —       | 用户名，唯一，仅限字母/数字/下划线/短横线 |
| nickname | string | 否   | null    | 昵称，最长 64 字                          |
| sex      | string | 否   | unknown | `unknown` / `male` / `female`             |

请求示例：

```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com", "password": "123456", "username": "user01", "nickname": "小优" }'
```

响应示例（HTTP 201）：

```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 604800,
    "expiresAt": "2026-11-03T05:00:00.000Z",
    "user": {
      "id": 4,
      "email": "user@example.com",
      "username": "user01",
      "nickname": "小优",
      "sex": "unknown",
      "role": "user",
      "createdAt": "2026-10-27T05:00:00.000Z",
      "updatedAt": "2026-10-27T05:00:00.000Z"
    }
  }
}
```

错误响应：

| 状态码 | 场景                        | 响应体                                         |
| ------ | --------------------------- | ---------------------------------------------- |
| 400    | 邮箱已注册                  | `{ "code": 400, "message": "邮箱已被注册" }`   |
| 400    | 用户名已存在                | `{ "code": 400, "message": "用户名已存在" }`   |
| 400    | 必填字段缺失或格式不正确    | `{ "code": 400, "message": "密码不能为空" }` 等 |

### POST /api/auth/login

前台登录并签发 `scope=web` 的 JWT。`account` 支持传邮箱或用户名；登录成功后的 token 需在需要登录的接口中通过 `Authorization: Bearer <token>` 携带。

| 字段     | 类型   | 必填 | 说明                                               |
| -------- | ------ | ---- | -------------------------------------------------- |
| account  | string | 是   | 邮箱或用户名（也可改用 `email` / `username` 字段） |
| password | string | 是   | 明文密码                                           |

请求示例：

```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{ "account": "user@example.com", "password": "123456" }'
```

响应结构与注册接口一致（`code` 为 0，`data.user` 不包含密码）。账号不存在或密码错误统一返回 401「账号或密码错误」。

### GET /api/auth/me

查询当前前台登录用户资料，响应中不包含密码。`GET /api/auth/profile` 为同义别名。

```bash
curl "http://localhost:3000/api/auth/me" \
  -H "Authorization: Bearer <token>"
```

### PUT /api/auth/me

更新当前用户资料，仅支持 `nickname`、`sex` 两个字段，其他字段会被忽略。`PUT /api/auth/profile` 为同义别名。

```bash
curl -X PUT "http://localhost:3000/api/auth/me" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "nickname": "新昵称", "sex": "female" }'
```

空请求体返回 400「没有需要更新的字段」。

### PUT /api/auth/password

修改当前用户密码。原密码错误返回 400「原密码不正确」；新密码长度需为 6-72 位。

| 字段        | 类型   | 必填 | 说明           |
| ----------- | ------ | ---- | -------------- |
| oldPassword | string | 是   | 原密码         |
| newPassword | string | 是   | 新密码，6-72 位 |

```bash
curl -X PUT "http://localhost:3000/api/auth/password" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "oldPassword": "123456", "newPassword": "abcdef" }'
```

### POST /api/auth/logout

JWT 无状态，服务端不维护会话；该接口仅返回成功提示，客户端删除本地 token 即可。

## 前台文章

### GET /api/articles

分页查询已发布文章，按创建时间倒序；列表不返回 `content` 正文。

| 参数     | 类型   | 必填 | 默认值 | 说明                          |
| -------- | ------ | ---- | ------ | ----------------------------- |
| page     | number | 否   | 1      | 页码，最小 1                  |
| pageSize | number | 否   | 10     | 每页条数，1~50                |
| keyword  | string | 否   | —      | 标题 / 摘要模糊搜索           |
| sort     | string | 否   | latest | `latest` 按时间倒序；`hot` 按浏览量倒序 |

```bash
curl "http://localhost:3000/api/articles?page=1&pageSize=10&sort=hot"
```

响应中的 `list` 仅包含 `published` 状态文章，草稿不会出现。

### GET /api/articles/:id

查询已发布文章详情（包含 `content` 正文），每次成功访问浏览量 `views` 原子 +1。草稿或不存在的文章统一返回 404「文章不存在」，避免暴露草稿状态。

```bash
curl "http://localhost:3000/api/articles/1"
```

| 状态码 | 场景               | 响应体                                       |
| ------ | ------------------ | -------------------------------------------- |
| 400    | `id` 不是正整数    | `{ "code": 400, "message": "文章 ID 无效" }` |
| 404    | 文章不存在或为草稿 | `{ "code": 404, "message": "文章不存在" }`   |

## 前台章节

章节属于课程，列表按 `rank` 升序、`id` 升序排列。

### GET /api/chapters

分页查询章节，列表不返回 `content` 正文，每条记录内嵌 `course`（id/name）。

| 参数      | 类型   | 必填 | 默认值 | 说明             |
| --------- | ------ | ---- | ------ | ---------------- |
| page      | number | 否   | 1      | 页码，最小 1     |
| pageSize  | number | 否   | 20     | 每页条数，1~100  |
| course_id | number | 否   | —      | 按所属课程筛选   |
| keyword   | string | 否   | —      | 章节标题模糊搜索 |

```bash
curl "http://localhost:3000/api/chapters?course_id=1"
```

### GET /api/chapters/:id

查询章节详情，包含 `content` 正文与所属课程信息。不存在时返回 404「章节不存在」。

```bash
curl "http://localhost:3000/api/chapters/1"
```

> 课程详情接口 `GET /api/courses/:id` 已内嵌该课程的章节目录（不含正文），进入具体章节时再调用本接口按需加载正文。

## 前台分类与课程

### GET /api/categories

查询分类列表，按 `rank` 升序排列，直接返回数组（不分页）。

### GET /api/courses

分页查询课程，按创建时间倒序；列表包含 `content` 供前端截取简介，每条课程内嵌 `category`（id/name/rank）与 `user`（id/username/nickname）。

| 参数           | 类型   | 必填 | 默认值 | 说明                 |
| -------------- | ------ | ---- | ------ | -------------------- |
| page           | number | 否   | 1      | 页码，最小 1         |
| pageSize       | number | 否   | 12     | 每页条数，1~60       |
| category_id    | number | 否   | —      | 按分类筛选           |
| is_recommended | string | 否   | —      | `true` / `false`     |
| keyword        | string | 否   | —      | 课程名称模糊搜索     |

### GET /api/courses/:id

查询课程详情，包含 `content` 正文、分类、作者，以及按 `rank` 升序排列的 `chapters` 章节目录（不含章节正文）。课程不存在时返回 404「课程不存在」。

## 前台系统信息

### GET /api/settings

查询站点信息（站点名称 `name`、备案号 `icp`、版权信息 `copyright`）。表中仅一条记录，记录不存在时自动初始化默认记录。

`GET /api/system/info` 与 `GET /api/settings/info` 为同义别名，返回内容一致。

```bash
curl "http://localhost:3000/api/settings"
```

## 前台点赞

点赞对象为课程。以下接口都需要前台登录态，token 必须携带 `scope=web`：

```http
Authorization: Bearer <token>
```

点赞与取消点赞都是幂等操作：重复点赞不会重复累加，重复取消也不会报错。

### POST /api/likes

| 字段      | 类型   | 必填 | 说明    |
| --------- | ------ | ---- | ------- |
| course_id | number | 是   | 课程 ID |

```bash
curl -X POST "http://localhost:3000/api/likes" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "course_id": 1 }'
```

响应示例：

```json
{ "code": 0, "message": "ok", "data": { "liked": true, "like_count": 129 } }
```

### DELETE /api/likes/:courseId

取消点赞，响应 `{ "liked": false, "like_count": 128 }`。也支持 `DELETE /api/likes` 并在请求体中传 `{ "course_id": 1 }`。

### GET /api/likes/:courseId

查询当前用户对该课程的点赞状态与课程总点赞数，响应 `{ "liked": true, "like_count": 129 }`。也支持 `GET /api/likes/status?course_id=1`。

### GET /api/likes

分页查询当前用户点赞过的课程，按点赞时间倒序。每条记录为课程字段（与前台课程列表一致，含 `content`）并附加 `likedAt`（点赞时间）。

| 参数     | 类型   | 必填 | 默认值 | 说明            |
| -------- | ------ | ---- | ------ | --------------- |
| page     | number | 否   | 1      | 页码，最小 1    |
| pageSize | number | 否   | 10     | 每页条数，1~50  |

响应结构与其他分页接口一致：`{ "list": [...], "pagination": { ... } }`。

### 课程维度别名

为方便前端按课程调用，同一组操作也支持：

| 方法   | 路径                           | 说明                     |
| ------ | ------------------------------ | ------------------------ |
| GET    | `/api/courses/:courseId/like`  | 查询点赞状态             |
| POST   | `/api/courses/:courseId/like`  | 点赞                     |
| DELETE | `/api/courses/:courseId/like`  | 取消点赞                 |

### 点赞错误响应

| 状态码 | 场景                   | 响应体                                             |
| ------ | ---------------------- | -------------------------------------------------- |
| 400    | 课程 ID 缺失或不是正整数 | `{ "code": 400, "message": "课程 ID 无效" }`     |
| 401    | 未登录或 token 不是前台登录态 | `{ "code": 401, "message": "请先登录" }` 等    |
| 404    | 课程不存在             | `{ "code": 404, "message": "课程不存在" }`         |
