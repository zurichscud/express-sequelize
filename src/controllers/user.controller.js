const { success, fail } = require('../utils/response');
const userService = require('../services/user.service');

// 字段白名单
const EDITABLE_FIELDS = ['email', 'password', 'username', 'nickname', 'sex', 'role'];

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

// 只允许客户端提交可编辑字段，字段级校验统一交给模型
function pickUserFields(body) {
  const source = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const payload = {};
  for (const field of EDITABLE_FIELDS) {
    if (source[field] !== undefined) {
      payload[field] = source[field];
    }
  }
  return payload;
}

/**
 * GET /api/users
 * 查询参数：
 *   page     页码，默认 1
 *   pageSize 每页条数，默认 10，最大 100
 *   keyword  邮箱/用户名/昵称模糊搜索
 *   sex      unknown | male | female
 *   role     user | admin
 */
async function listUsers(req, res, next) {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const pageSize = Math.min(toPositiveInt(req.query.pageSize, 10), 100);
    const keyword = String(req.query.keyword || '').trim();
    const sex = String(req.query.sex || '').trim();
    const role = String(req.query.role || '').trim();

    const { list, total } = await userService.listUsers({
      page,
      pageSize,
      keyword,
      sex,
      role
    });

    success(res, {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/users
 * 请求体：
 *   email    必填，邮箱，唯一
 *   password 必填，明文密码，6-72 位（存储时自动哈希）
 *   username 必填，用户名，唯一，仅限字母/数字/下划线/短横线
 *   nickname 选填，昵称，最长 64 字
 *   sex      选填，unknown | male | female，默认 unknown
 *   role     选填，user | admin，默认 user
 */
async function createUser(req, res, next) {
  try {
    const user = await userService.createUser(pickUserFields(req.body));

    success(res, user, { status: 201 });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/:id
 * 查询单个用户详情
 */
async function getUser(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '用户 ID 无效');
    }

    const user = await userService.getUserById(id);
    if (!user) {
      return fail(res, 404, '用户不存在');
    }

    success(res, user);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/:id
 * 更新用户（仅更新请求体中提供的字段）
 * 请求体：
 *   email    选填，邮箱，唯一
 *   password 选填，明文密码，6-72 位（存储时自动哈希）
 *   username 选填，用户名，唯一
 *   nickname 选填，昵称，传空字符串可清空
 *   sex      选填，unknown | male | female
 *   role     选填，user | admin
 */
async function updateUser(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '用户 ID 无效');
    }

    const payload = pickUserFields(req.body);
    if (!Object.keys(payload).length) {
      return fail(res, 400, '没有需要更新的字段');
    }

    const user = await userService.updateUserById(id, payload);
    if (!user) {
      return fail(res, 404, '用户不存在');
    }

    success(res, user);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/users/:id
 * 删除单个用户
 */
async function deleteUser(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '用户 ID 无效');
    }

    const deleted = await userService.deleteUserById(id);
    if (!deleted) {
      return fail(res, 404, '用户不存在');
    }

    success(res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
};
