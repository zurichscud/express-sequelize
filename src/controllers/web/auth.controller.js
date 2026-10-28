const { success, fail } = require('../../utils/response');
const appUserService = require('../../services/appUser.service');

// 注册只允许提交普通用户资料，role 等敏感字段由后台接口维护
const REGISTER_FIELDS = ['email', 'password', 'username', 'nickname', 'sex'];
// 前台个人中心只允许修改昵称和性别
const PROFILE_FIELDS = ['nickname', 'sex'];

// 只允许客户端提交白名单字段，字段级校验统一交给模型
function pickFields(body, fields) {
  const source = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const payload = {};
  for (const field of fields) {
    if (source[field] !== undefined) {
      payload[field] = source[field];
    }
  }
  return payload;
}

/**
 * POST /api/auth/register
 * 请求体：
 *   email    必填，邮箱，唯一
 *   password 必填，明文密码，6-72 位
 *   username 必填，用户名，唯一，仅限字母/数字/下划线/短横线
 *   nickname 选填，昵称，最长 64 字
 *   sex      选填，unknown | male | female，默认 unknown
 * 注册成功直接返回前台登录态
 */
async function register(req, res, next) {
  try {
    const data = await appUserService.register(pickFields(req.body, REGISTER_FIELDS));
    success(res, data, { status: 201, message: '注册成功' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * 请求体：
 *   account  必填，邮箱或用户名（兼容 email / username 字段）
 *   password 必填，明文密码
 * 登录成功签发 scope=web 的 JWT，不能用于 /api/admin 接口
 */
async function login(req, res, next) {
  try {
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const accountSource = body.account ?? body.email ?? body.username;
    const account = typeof accountSource === 'string' ? accountSource.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!account) {
      return fail(res, 400, '请输入邮箱或用户名');
    }
    if (!password) {
      return fail(res, 400, '请输入密码');
    }

    const data = await appUserService.login({ account, password });
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
 * 更新当前登录用户资料（仅昵称、性别）
 */
async function updateProfile(req, res, next) {
  try {
    const payload = pickFields(req.body, PROFILE_FIELDS);
    if (!Object.keys(payload).length) {
      return fail(res, 400, '没有需要更新的字段');
    }

    const user = await appUserService.updateUserProfile(req.user.id, payload);
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
 * 请求体：
 *   oldPassword 必填，原密码
 *   newPassword 必填，新密码，6-72 位
 */
async function changePassword(req, res, next) {
  try {
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const oldPassword = typeof body.oldPassword === 'string' ? body.oldPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!oldPassword) {
      return fail(res, 400, '请输入原密码');
    }
    if (!newPassword) {
      return fail(res, 400, '请输入新密码');
    }

    const exists = await appUserService.changePassword(req.user.id, { oldPassword, newPassword });
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
