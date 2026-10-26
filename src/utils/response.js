/**
 * 统一成功响应
 * @param {import('express').Response} res
 * @param {*} [data] 响应数据
 * @param {{ status?: number, message?: string }} [options]
 */
function success(res, data = null, options = {}) {
  const { status = 200, message = 'ok' } = options;
  return res.status(status).json({ code: 0, message, data });
}

/**
 * 统一失败响应，code 与 HTTP 状态码保持一致
 * @param {import('express').Response} res
 * @param {number} [status] HTTP 状态码
 * @param {string} [message] 错误提示
 */
function fail(res, status = 400, message = '请求失败') {
  return res.status(status).json({ code: status, message });
}

module.exports = {
  success,
  fail
};
