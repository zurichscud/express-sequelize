const { success, successPage, fail } = require('../../utils/response');
const appUserService = require('../../services/appUser.service');

/**
 * GET /api/admin/app-users
 * 查询前台用户列表（课程归属选择、仪表盘统计与前台用户管理共用）
 * 分页参数由 pagination.middleware.js 处理，其余查询参数由 user.validator.js 校验
 */
async function listUsers(req, res, next) {
  try {
    const { keyword, sex } = req.validated.query;

    const { list, total } = await appUserService.listUsers({
      ...req.pagination,
      keyword,
      sex
    });

    successPage(res, { list, total }, req.pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/app-users
 * 创建前台用户（请求体字段与格式由 user.validator.js 校验）
 *   email    必填，邮箱，唯一
 *   password 必填，明文密码，6-72 位（存储时自动哈希）
 *   username 必填，用户名，唯一，仅限字母/数字/下划线/短横线
 *   nickname 选填，昵称，最长 64 字
 *   sex      选填，unknown | male | female，默认 unknown
 */
async function createUser(req, res, next) {
  try {
    const user = await appUserService.createUser(req.validated.body);

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
    const { id } = req.validated.params;

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
 * 更新前台用户（仅更新请求体中提供的字段，请求体字段由 schema 校验）
 *   email    选填，邮箱，唯一
 *   password 选填，明文密码，6-72 位（存储时自动哈希）
 *   username 选填，用户名，唯一
 *   nickname 选填，昵称，传空字符串可清空
 *   sex      选填，unknown | male | female
 */
async function updateUser(req, res, next) {
  try {
    const { id } = req.validated.params;

    const user = await appUserService.updateUserById(id, req.validated.body);
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
    const { id } = req.validated.params;

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
