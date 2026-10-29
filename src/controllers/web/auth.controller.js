const { success, fail } = require('../../utils/response');
const appUserService = require('../../services/appUser.service');

/**
 * POST /api/auth/register
 * 注册请求体由 user.validator.js 校验：
 *   email    必填，邮箱，唯一
 *   password 必填，明文密码，6-72 位
 *   username 必填，用户名，唯一，仅限字母/数字/下划线/短横线
 *   nickname 选填，昵称，最长 64 字
 *   sex      选填，unknown | male | female，默认 unknown
 * 注册成功直接返回前台登录态
 */
async function register(req, res, next) {
  try {
    const data = await appUserService.register(req.validated.body);
    success(res, data, { status: 201, message: '注册成功' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * 登录请求体由 user.validator.js 统一解析成 { account, password }
 * 账号可以是邮箱或用户名（兼容 email / username 字段）
 * 登录成功签发 scope=web 的 JWT，不能用于 /api/admin 接口
 */
async function login(req, res, next) {
  try {
    const data = await appUserService.login(req.validated.body);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * 查询当前登录用户资料（不返回密码）
 */
async function getProfile(req, res, next) {
  try {
    const user = await appUserService.getUserById(req.user.id);
    if (!user) {
      return fail(res, 401, '登录状态无效，请重新登录');
    }

    success(res, user);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/me
 * 更新当前登录用户资料（仅昵称、性别，空请求体由 schema 拦截）
 */
async function updateProfile(req, res, next) {
  try {
    const user = await appUserService.updateUserProfile(req.user.id, req.validated.body);
    if (!user) {
      return fail(res, 401, '登录状态无效，请重新登录');
    }

    success(res, user);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/password
 * 修改密码，请求体由 user.validator.js 校验：
 *   oldPassword 必填，原密码
 *   newPassword 必填，新密码，6-72 位
 */
async function changePassword(req, res, next) {
  try {
    const exists = await appUserService.changePassword(req.user.id, req.validated.body);
    if (!exists) {
      return fail(res, 401, '登录状态无效，请重新登录');
    }

    success(res, null, { message: '密码修改成功' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * JWT 无状态，服务端不维护会话，客户端删除本地 token 即可
 */
async function logout(req, res) {
  success(res, null, { message: '已退出登录' });
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
};
