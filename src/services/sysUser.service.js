const { Op, UniqueConstraintError } = require('sequelize');
const { SysUser } = require('../models');
const {
  assertPasswordStrength,
  toUniqueError,
  toSafeUser,
  issueAuthResult,
  verifyCredentials
} = require('./user.helpers');

const SEXES = ['unknown', 'male', 'female'];
const ROLES = ['user', 'admin'];

// 系统用户 1 号为超级管理员，禁止编辑和删除
const SUPER_ADMIN_ID = 1;

// 查询结果统一不返回密码
const SAFE_ATTRIBUTES = ['id', 'email', 'username', 'nickname', 'sex', 'role', 'createdAt', 'updatedAt'];

/**
 * 超级管理员保护
 * @param {number|string} id
 * @param {'编辑'|'删除'} action
 */
function assertNotSuperAdmin(id, action) {
  if (Number(id) === SUPER_ADMIN_ID) {
    const businessError = new Error(`超级管理员不可${action}`);
    businessError.status = 403;
    throw businessError;
  }
}

/**
 * 只保留可对外暴露的字段，避免把密码哈希返回给客户端
 * @param {object} user
 * @returns {object}
 */
function toSafeSysUser(user) {
  return toSafeUser(user, SAFE_ATTRIBUTES);
}

/**
 * 后台登录（只查询 sys_users）
 * 账号可以传邮箱或用户名
 * @param {{ account: string, password: string }} credentials
 * @returns {Promise<object>} 用户不存在或密码错误时抛出 401
 */
async function login({ account, password }) {
  const user = await verifyCredentials(SysUser, { account, password });
  return issueAuthResult(toSafeSysUser(user), 'admin');
}

/**
 * 分页查询系统用户列表
 * @param {{ page: number, pageSize: number, keyword?: string, sex?: string, role?: string }} options
 * @returns {Promise<{ list: object[], total: number }>}
 */
async function listUsers({ page, pageSize, keyword, sex, role }) {
  const where = {};
  if (SEXES.includes(sex)) {
    where.sex = sex;
  }
  if (ROLES.includes(role)) {
    where.role = role;
  }
  if (keyword) {
    where[Op.or] = [
      { email: { [Op.like]: `%${keyword}%` } },
      { username: { [Op.like]: `%${keyword}%` } },
      { nickname: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const { count, rows } = await SysUser.findAndCountAll({
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
 * 按 ID 查询系统用户详情
 * @param {number|string} id
 */
async function getUserById(id) {
  return SysUser.findByPk(id, { attributes: SAFE_ATTRIBUTES });
}

/**
 * 创建系统用户（密码在模型钩子中自动哈希）
 * @param {object} data
 */
async function createUser(data) {
  if (data.password !== undefined) {
    assertPasswordStrength(data.password);
  }
  // 密码缺失时交给模型 notNull 校验，提示「密码不能为空」

  try {
    const user = await SysUser.create(data);
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
 * 按 ID 更新系统用户（仅更新传入字段；传 password 时自动重新哈希）
 * @param {number|string} id
 * @param {object} data
 * @returns {Promise<object|null>} 用户不存在时返回 null
 */
async function updateUserById(id, data) {
  assertNotSuperAdmin(id, '编辑');
  if (data.password !== undefined) {
    assertPasswordStrength(data.password);
  }

  const user = await SysUser.findByPk(id, { attributes: SAFE_ATTRIBUTES });
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
 * 按 ID 删除系统用户
 * 附件表外键为 ON DELETE SET NULL，删除后附件记录保留
 * @param {number|string} id
 * @returns {Promise<boolean>} 用户不存在时返回 false
 */
async function deleteUserById(id) {
  assertNotSuperAdmin(id, '删除');
  const user = await SysUser.findByPk(id, { attributes: SAFE_ATTRIBUTES });
  if (!user) {
    return false;
  }

  await user.destroy();
  return true;
}

module.exports = {
  login,
  listUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById
};
