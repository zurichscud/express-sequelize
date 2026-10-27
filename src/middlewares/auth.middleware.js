const { verifyToken } = require('../utils/jwt');
const { fail } = require('../utils/response');

/**
 * JWT 认证中间件
 * 校验请求头 Authorization: Bearer <token>，通过后把用户信息挂到 req.user，
 * 供后续接口按需使用（如 req.user.id、req.user.role）
 */
function authenticate(req, res, next) {
  const header = req.get('Authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());

  if (!match) {
    res.set('WWW-Authenticate', 'Bearer');
    return fail(res, 401, '请先登录');
  }

  try {
    const payload = verifyToken(match[1]);
    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role
    };
    return next();
  } catch (err) {
    // token 过期或签名不合法属于认证失败，配置缺失等其他异常交给统一错误处理
    if (err.name === 'TokenExpiredError') {
      res.set('WWW-Authenticate', 'Bearer error="invalid_token"');
      return fail(res, 401, '登录已过期，请重新登录');
    }
    if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
      res.set('WWW-Authenticate', 'Bearer error="invalid_token"');
      return fail(res, 401, '登录状态无效，请重新登录');
    }
    return next(err);
  }
}

module.exports = {
  authenticate
};
