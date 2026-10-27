const { verifyToken } = require('../utils/jwt');
const { fail } = require('../utils/response');

/**
 * 从请求头 Authorization: Bearer <token> 中取出 token
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function extractToken(req) {
  const header = req.get('Authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1] : null;
}

/**
 * 把 jsonwebtoken 的校验异常转换成统一的 401 响应
 * 配置缺失等其他异常交给全局错误处理
 * @param {import('express').Response} res
 * @param {Error} err
 * @param {import('express').NextFunction} next
 */
function handleVerifyError(res, err, next) {
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

/**
 * 校验 token 并把用户信息挂到 req.user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @param {'admin'|'web'} scope
 * @param {(claims: object) => boolean} [isAllowed] 额外的载荷校验
 */
function verifyRequest(req, res, next, scope, isAllowed) {
  const token = extractToken(req);
  if (!token) {
    res.set('WWW-Authenticate', 'Bearer');
    return fail(res, 401, '请先登录');
  }

  try {
    const payload = verifyToken(token);
    // 后台与前台登录态通过 scope 隔离，避免互相复用
    if ((payload.scope && payload.scope !== scope) || (isAllowed && !isAllowed(payload))) {
      res.set('WWW-Authenticate', 'Bearer error="invalid_token"');
      return fail(res, 401, '登录状态无效，请重新登录');
    }

    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      scope: payload.scope || scope
    };
    return next();
  } catch (err) {
    return handleVerifyError(res, err, next);
  }
}

/**
 * 后台管理端 JWT 认证中间件
 * 兼容早期未写入 scope 的 token，但拒绝前台 web 登录态
 */
function authenticate(req, res, next) {
  return verifyRequest(req, res, next, 'admin');
}

/**
 * 前台 JWT 认证中间件
 * 只接受前台登录接口签发的 scope=web token
 */
function authenticateWeb(req, res, next) {
  return verifyRequest(req, res, next, 'web', (payload) => payload.scope === 'web');
}

module.exports = {
  authenticate,
  authenticateWeb
};
