const bcrypt = require('bcryptjs');

// 哈希轮数，10 是业界常用默认值，登录耗时约 100ms 量级
const SALT_ROUNDS = 10;

/**
 * 生成密码哈希
 * bcrypt 自带随机盐，输出格式为 $2a$10$...（60 字符），无需手动拼接盐
 * @param {string} password 明文密码
 * @returns {string}
 */
function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

/**
 * 校验明文密码是否与存储的哈希匹配（恒时比较，防时序攻击）
 * @param {string} password 明文密码
 * @param {string} stored 存储的 bcrypt 哈希
 * @returns {boolean}
 */
function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') {
    return false;
  }
  return bcrypt.compareSync(password, stored);
}

module.exports = {
  hashPassword,
  verifyPassword
};
