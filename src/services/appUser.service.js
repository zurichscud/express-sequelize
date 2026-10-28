const { Op, UniqueConstraintError } = require('sequelize');
const { AppUser, Course } = require('../models');
const { verifyPassword } = require('../utils/password');
const {
  assertPasswordStrength,
  toUniqueError,
  toSafeUser,
  issueAuthResult,
  verifyCredentials
} = require('./user.helpers');

const SEXES = ['unknown', 'male', 'female'];

// app_users 不存储角色，对外仍保留 role=user 以兼容前台登录态结构
const SAFE_ATTRIBUTES = ['id', 'email', 'username', 'nickname', 'sex', 'createdAt', 'updatedAt'];

/**
 * 只保留可对外暴露的字段，避免把密码哈希返回给客户端
 * @param {object} user
 * @param {{ withRole?: boolean }} [options]
 * @returns {object}
 */
function toSafeAppUser(user, { withRole = false } = {}) {
  return toSafeUser(user, SAFE_ATTRIBUTES, withRole ? { role: 'user' } : {});
}

/**
 * 前台登录（只查询 app_users）
 * 账号可以传邮箱或用户名
 * @param {{ account: string, password: string }} credentials
 * @returns {Promise<object>} 用户不存在或密码错误时抛出 401
 */
async function login({ account, password }) {
  const user = await verifyCredentials(AppUser, { account, password });
  return issueAuthResult(toSafeAppUser(user, { withRole: true }), 'web');
}

/**
 * 创建前台用户（密码在模型钩子中自动哈希）
 * @param {object} data
 * @returns {Promise<object>}
 */
async function createUser(data) {
  if (data.password !== undefined) {
    assertPasswordStrength(data.password);
  }
  // 密码缺失时交给模型 notNull 校验，提示「密码不能为空」

  try {
    const user = await AppUser.create(data);
    // 重新查询，避免响应中带出密码字段
    return getUserById(user.id);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw toUniqueError(err);
    }
    throw err;
  }
}

/**
 * 前台注册并直接签发登录态（注册用户固定为普通用户，不接受 role 入参）
 * @param {{ email: string, password: string, username: string, nickname?: string, sex?: string }} data
 * @returns {Promise<object>}
 */
async function register(data) {
  const user = await createUser(data);
  return issueAuthResult(user, 'web');
}

/**
 * 更新当前登录用户的资料（仅昵称、性别）
 * @param {number|string} id
 * @param {{ nickname?: string, sex?: string }} data
 * @returns {Promise<object|null>} 用户不存在时返回 null
 */
async function updateUserProfile(id, data) {
  const user = await AppUser.findByPk(id);
  if (!user) {
    return null;
  }

  await user.update(data);
  return getUserById(id);
}

/**
 * 修改当前登录用户的密码
 * 需要校验原密码，新密码沿用与注册一致的格式要求
 * @param {number|string} id
 * @param {{ oldPassword: string, newPassword: string }} data
 * @returns {Promise<boolean>} 用户不存在时返回 false
 */
async function changePassword(id, { oldPassword, newPassword }) {
  const user = await AppUser.findByPk(id);
  if (!user) {
    return false;
  }

  if (!verifyPassword(oldPassword, user.password)) {
    const businessError = new Error('原密码不正确');
    businessError.status = 400;
    throw businessError;
  }

  assertPasswordStrength(newPassword);
  // 赋值后 save 会触发模型 beforeUpdate 钩子重新哈希
  user.password = newPassword;
  await user.save();
  return true;
}

/**
 * 分页查询前台用户列表（后台课程归属选择使用）
 * @param {{ page: number, pageSize: number, keyword?: string, sex?: string }} options
 * @returns {Promise<{ list: object[], total: number }>}
 */
async function listUsers({ page, pageSize, keyword, sex }) {
  const where = {};
  if (SEXES.includes(sex)) {
    where.sex = sex;
  }
  if (keyword) {
    where[Op.or] = [
      { email: { [Op.like]: `%${keyword}%` } },
      { username: { [Op.like]: `%${keyword}%` } },
      { nickname: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const { count, rows } = await AppUser.findAndCountAll({
    where,
    attributes: SAFE_ATTRIBUTES,
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC']
    ],
    offset: (page - 1) * pageSize,
    limit: pageSize
  });

  return { list: rows, total: count };
}

/**
 * 按 ID 查询前台用户详情（不含密码）
 * @param {number|string} id
 */
async function getUserById(id) {
  const user = await AppUser.findByPk(id, { attributes: SAFE_ATTRIBUTES });
  return user ? toSafeAppUser(user, { withRole: true }) : null;
}

/**
 * 按 ID 更新前台用户（仅更新传入字段；传 password 时自动重新哈希）
 * @param {number|string} id
 * @param {object} data
 * @returns {Promise<object|null>} 用户不存在时返回 null
 */
async function updateUserById(id, data) {
  if (data.password !== undefined) {
    assertPasswordStrength(data.password);
  }

  const user = await AppUser.findByPk(id, { attributes: SAFE_ATTRIBUTES });
  if (!user) {
    return null;
  }

  try {
    await user.update(data);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw toUniqueError(err);
    }
    throw err;
  }
  // 重新查询：update 会把写入的字段（含密码）合并回实例，直接返回会泄漏密码
  return getUserById(id);
}

/**
 * 按 ID 删除前台用户（名下还有课程时拒绝删除）
 * 点赞记录由外键 ON DELETE CASCADE 自动清理
 * @param {number|string} id
 * @returns {Promise<boolean>} 用户不存在时返回 false
 */
async function deleteUserById(id) {
  const user = await AppUser.findByPk(id, { attributes: SAFE_ATTRIBUTES });
  if (!user) {
    return false;
  }

  const courseCount = await Course.count({ where: { user_id: id } });
  if (courseCount > 0) {
    const businessError = new Error(`该用户名下还有 ${courseCount} 门课程，无法删除`);
    businessError.status = 400;
    throw businessError;
  }

  await user.destroy();
  return true;
}

module.exports = {
  login,
  register,
  createUser,
  updateUserProfile,
  changePassword,
  listUsers,
  getUserById,
  updateUserById,
  deleteUserById
};
