const { Op, UniqueConstraintError } = require('sequelize');
const { verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

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
 * @param {object} user Sequelize 用户实例或普通对象
 * @param {string[]} fields 白名单字段
 * @param {object} [extras] 额外补充的展示字段
 * @returns {object}
 */
function toSafeUser(user, fields, extras = {}) {
  const data = typeof user.get === 'function' ? user.get({ plain: true }) : user;
  const safe = {};
  for (const field of fields) {
    safe[field] = data[field];
  }
  return { ...safe, ...extras };
}

/**
 * 签发登录态。scope 用于隔离后台与前台登录态：
 * 后台 token 为 admin，前台 token 为 web，互不通用
 * @param {object} safeUser 已剔除敏感字段的用户信息
 * @param {'admin'|'web'} scope
 * @returns {{ token: string, tokenType: string, expiresIn: number, expiresAt: string, user: object }}
 */
function issueAuthResult(safeUser, scope) {
  const { token, expiresIn, expiresAt } = signToken({
    sub: safeUser.id,
    username: safeUser.username,
    role: safeUser.role,
    scope
  });

  return {
    token,
    tokenType: 'Bearer',
    expiresIn,
    expiresAt,
    user: safeUser
  };
}

/**
 * 按账号查询用户，账号可以传邮箱或用户名
 * @param {import('sequelize').ModelStatic<import('sequelize').Model>} Model
 * @param {string} account
 * @returns {Promise<object|null>}
 */
function findUserByAccount(Model, account) {
  // 邮箱入库时统一转小写，这里同步转换；用户名按原值匹配
  return Model.findOne({
    where: {
      [Op.or]: [{ email: account.toLowerCase() }, { username: account }]
    }
  });
}

/**
 * 校验账号密码，账号不存在与密码错误返回同一提示
 * @param {import('sequelize').ModelStatic<import('sequelize').Model>} Model
 * @param {{ account: string, password: string }} credentials
 * @returns {Promise<object>}
 */
async function verifyCredentials(Model, { account, password }) {
  const user = await findUserByAccount(Model, account);
  if (!user || !verifyPassword(password, user.password)) {
    const authError = new Error('账号或密码错误');
    authError.status = 401;
    throw authError;
  }
  return user;
}

module.exports = {
  assertPasswordStrength,
  toUniqueError,
  toSafeUser,
  issueAuthResult,
  findUserByAccount,
  verifyCredentials
};
