const jwt = require('jsonwebtoken');

// 默认有效期 7 天，可通过 JWT_EXPIRES_IN 覆盖（如 2h、30m、7d）
const DEFAULT_EXPIRES_IN = '7d';

/**
 * 读取签名密钥。密钥只从环境变量注入，不提供默认值，避免生产环境误用弱密钥
 * @returns {string}
 */
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const configError = new Error('JWT_SECRET 未配置，无法签发或校验 token');
    configError.status = 500;
    throw configError;
  }
  return secret;
}

/**
 * 签发 JWT
 * @param {object} payload 载荷，需由调用方保证不含密码等敏感信息
 * @returns {{ token: string, expiresIn: number, expiresAt: string }}
 */
function signToken(payload) {
  const expiresIn = process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN;
  const token = jwt.sign(payload, getSecret(), { expiresIn });
  const decoded = jwt.decode(token);

  return {
    token,
    expiresIn: decoded.exp - decoded.iat,
    expiresAt: new Date(decoded.exp * 1000).toISOString()
  };
}

/**
 * 校验 JWT，签名错误或已过期时会抛出 jsonwebtoken 的错误
 * @param {string} token
 * @returns {object} 解码后的载荷
 */
function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

module.exports = {
  signToken,
  verifyToken
};
