const { success, fail } = require('../../utils/response');
const appUserService = require('../../services/appUser.service');

// 字段白名单：前台用户没有角色字段，密码仅在创建或重置时提交
const EDITABLE_FIELDS = ['email', 'password', 'username', 'nickname', 'sex'];

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

// 校验并返回路径中的用户 ID
function parseUserId(req) {
  const id = String(req.params.id || '').trim();
  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    return null;
  }
  return id;
}

/**
 * GET /api/admin/app-users
 * 查询前台用户列表（课程归属选择、仪表盘统计与前台用户管理共用）
 * 查询参数：
 *   page     页码，默认 1
 *   pageSize 每页条数，默认 10，最大 100
 *   keyword  邮箱/用户名/昵称模糊搜索
 *   sex      unknown | male | female
 */
async function listUsers(req, res, next) {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const pageSize = Math.min(toPositiveInt(req.query.pageSize, 10), 100);
    const keyword = String(req.query.keyword || '').trim();
    const sex = String(req.query.sex || '').trim();

    const { list, total } = await appUserService.listUsers({
      page,
      pageSize,
      keyword,
      sex
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
 * POST /api/admin/app-users
 * 创建前台用户
 * 请求体：
 *   email    必填，邮箱，唯一
 *   password 必填，明文密码，6-72 位（存储时自动哈希）
 *   username 必填，用户名，唯一，仅限字母/数字/下划线/短横线
 *   nickname 选填，昵称，最长 64 字
 *   sex      选填，unknown | male | female，默认 unknown
 */
async function createUser(req, res, next) {
  try {
    const user = await appUserService.createUser(pickUserFields(req.body));

    success(res, user, { status: 201 });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/app-users/:id
 * 查询单个前台用户详情
 */
async function getUser(req, res, next) {
  try {
    const id = parseUserId(req);
    if (!id) {
      return fail(res, 400, '用户 ID 无效');
    }

    const user = await appUserService.getUserById(id);
    if (!user) {
      return fail(res, 404, '用户不存在');
    }

    success(res, user);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/app-users/:id
 * 更新前台用户（仅更新请求体中提供的字段）
 * 请求体：
 *   email    选填，邮箱，唯一
 *   password 选填，明文密码，6-72 位（存储时自动哈希）
 *   username 选填，用户名，唯一
 *   nickname 选填，昵称，传空字符串可清空
 *   sex      选填，unknown | male | female
 */
async function updateUser(req, res, next) {
  try {
    const id = parseUserId(req);
    if (!id) {
      return fail(res, 400, '用户 ID 无效');
    }

    const payload = pickUserFields(req.body);
    if (!Object.keys(payload).length) {
      return fail(res, 400, '没有需要更新的字段');
    }

    const user = await appUserService.updateUserById(id, payload);
    if (!user) {
      return fail(res, 404, '用户不存在');
    }

    success(res, user);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/app-users/:id
 * 删除单个前台用户（名下还有课程时拒绝删除）
 */
async function deleteUser(req, res, next) {
  try {
    const id = parseUserId(req);
    if (!id) {
      return fail(res, 400, '用户 ID 无效');
    }

    const deleted = await appUserService.deleteUserById(id);
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
