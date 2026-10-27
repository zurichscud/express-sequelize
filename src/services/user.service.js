const { Op, UniqueConstraintError } = require('sequelize');
const { Course, User } = require('../models');
const { verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

const SEXES = ['unknown', 'male', 'female'];
const ROLES = ['user', 'admin'];

// 查询结果统一不返回密码
const SAFE_ATTRIBUTES = ['id', 'email', 'username', 'nickname', 'sex', 'role', 'createdAt', 'updatedAt'];

/**
 * 校验明文密码格式（放在服务层而非模型层：
 * update 时钩子哈希后模型校验会作用于哈希值，导致误判）
 * @param {*} password
 */
function assertPasswordStrength(password) {
  if (typeof password !== 'string' || password.length < 6 || password.length > 72) {
    const businessError = new Error('密码长度需在 6-72 位之间');
    businessError.status = 400;
    throw businessError;
  }
}

/**
 * 把唯一约束冲突转成带中文提示的业务错误
 * @param {UniqueConstraintError} err
 * @returns {Error}
 */
function toUniqueError(err) {
  const field = err.errors && err.errors[0] && err.errors[0].path;
  const message =
    field === 'email' ? '邮箱已被注册' : field === 'username' ? '用户名已存在' : '邮箱或用户名已存在';
  const businessError = new Error(message);
  businessError.status = 400;
  return businessError;
}

/**
 * 只保留可对外暴露的字段，避免把密码哈希返回给客户端
 * @param {object} user Sequelize 用户实例
 * @returns {object}
 */
function toSafeUser(user) {
  const data = user.get({ plain: true });
  const safe = {};
  for (const field of SAFE_ATTRIBUTES) {
    safe[field] = data[field];
  }
  return safe;
}

/**
 * 登录取 token
 * 账号可以传邮箱或用户名（account，兼容 email / username 字段）
 * @param {{ account: string, password: string }} credentials
 * @returns {Promise<object>} 用户不存在或密码错误时抛出 401
 */
async function login({ account, password }) {
  // 邮箱入库时统一转小写，这里同步转换；用户名按原值匹配
  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: account.toLowerCase() }, { username: account }]
    }
  });

  // 账号不存在和密码错误返回同一提示，避免暴露账号是否已注册
  if (!user || !verifyPassword(password, user.password)) {
    const authError = new Error('账号或密码错误');
    authError.status = 401;
    throw authError;
  }

  const { token, expiresIn, expiresAt } = signToken({
    sub: user.id,
    username: user.username,
    role: user.role
  });

  return {
    token,
    tokenType: 'Bearer',
    expiresIn,
    expiresAt,
    user: toSafeUser(user)
  };
}

/**
 * 分页查询用户列表
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

  const { count, rows } = await User.findAndCountAll({
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
 * 按 ID 查询用户详情
 * @param {number|string} id
 */
async function getUserById(id) {
  return User.findByPk(id, { attributes: SAFE_ATTRIBUTES });
}

/**
 * 创建用户（密码在模型钩子中自动哈希）
 * @param {object} data
 */
async function createUser(data) {
  if (data.password !== undefined) {
    assertPasswordStrength(data.password);
  }
  // 密码缺失时交给模型 notNull 校验，提示「密码不能为空」

  try {
    const user = await User.create(data);
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
 * 按 ID 更新用户（仅更新传入字段；传 password 时自动重新哈希）
 * @param {number|string} id
 * @param {object} data
 * @returns {Promise<object|null>} 用户不存在时返回 null
 */
async function updateUserById(id, data) {
  if (data.password !== undefined) {
    assertPasswordStrength(data.password);
  }

  const user = await User.findByPk(id, { attributes: SAFE_ATTRIBUTES });
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
 * 按 ID 删除用户
 * @param {number|string} id
 * @returns {Promise<boolean>} 用户不存在时返回 false
 */
async function deleteUserById(id) {
  const user = await User.findByPk(id, { attributes: SAFE_ATTRIBUTES });
  if (!user) {
    return false;
  }

  // 名下还有课程时拒绝删除，否则数据库外键约束会直接报错
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
  listUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById
};
