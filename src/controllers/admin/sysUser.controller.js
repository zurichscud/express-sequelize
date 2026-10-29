const { success, successPage, fail } = require('../../utils/response');
const sysUserService = require('../../services/sysUser.service');

/**
 * POST /api/admin/users/login
 * 后台登录，只校验 sys_users 表
 * 登录请求体由 user.validator.js 统一解析成 { account, password }
 * 校验通过后返回 JWT，后续请求放在 Authorization: Bearer <token> 中
 */
async function login(req, res, next) {
  try {
    const data = await sysUserService.login(req.validated.body);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users
 * 查询系统用户列表（sys_users）
 * 分页参数由 pagination.middleware.js 处理，其余查询参数由 user.validator.js 校验
 */
async function listUsers(req, res, next) {
  try {
    const { keyword, sex, role } = req.validated.query;

    const { list, total } = await sysUserService.listUsers({
      ...req.pagination,
      keyword,
      sex,
      role
    });

    successPage(res, { list, total }, req.pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/users
 * 创建系统用户（请求体字段与格式由 user.validator.js 校验）
 *   email    必填，邮箱，唯一
 *   password 必填，明文密码，6-72 位（存储时自动哈希）
 *   username 必填，用户名，唯一，仅限字母/数字/下划线/短横线
 *   nickname 选填，昵称，最长 64 字
 *   sex      选填，unknown | male | female，默认 unknown
 *   role     选填，user | admin，默认 user
 */
async function createUser(req, res, next) {
  try {
    const user = await sysUserService.createUser(req.validated.body);

    success(res, user, { status: 201 });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users/:id
 * 查询单个用户详情
 */
async function getUser(req, res, next) {
  try {
    const { id } = req.validated.params;

    const user = await sysUserService.getUserById(id);
    if (!user) {
      return fail(res, 404, '用户不存在');
    }

    success(res, user);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/users/:id
 * 更新用户（仅更新请求体中提供的字段，请求体字段由 schema 校验）
 *   email    选填，邮箱，唯一
 *   password 选填，明文密码，6-72 位（存储时自动哈希）
 *   username 选填，用户名，唯一
 *   nickname 选填，昵称，传空字符串可清空
 *   sex      选填，unknown | male | female
 *   role     选填，user | admin
 */
async function updateUser(req, res, next) {
  try {
    const { id } = req.validated.params;

    const user = await sysUserService.updateUserById(id, req.validated.body);
    if (!user) {
      return fail(res, 404, '用户不存在');
    }

    success(res, user);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/users/:id
 * 删除单个用户
 */
async function deleteUser(req, res, next) {
  try {
    const { id } = req.validated.params;

    const deleted = await sysUserService.deleteUserById(id);
    if (!deleted) {
      return fail(res, 404, '用户不存在');
    }

    success(res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
};
