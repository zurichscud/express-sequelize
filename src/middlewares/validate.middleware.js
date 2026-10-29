const { fail } = require('../utils/response');

/**
 * 去掉值为 undefined 的键，避免把“未传”字段带进 service
 * @param {*} data
 */
function omitUndefined(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

/**
 * 用 zod schema 校验请求，解析后的数据挂到 req.validated，控制器只读取校验后的值
 * 校验失败返回 400，并透出 schema 中定义的中文提示
 * @param {{ params?: import('zod').ZodType, query?: import('zod').ZodType, body?: import('zod').ZodType }} schemas
 * @returns {import('express').RequestHandler}
 */
function validate(schemas) {
  return (req, res, next) => {
    const validated = {};

    for (const key of ['params', 'query', 'body']) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key]);
      if (!result.success) {
        const issue = result.error.issues[0];
        return fail(res, 400, (issue && issue.message) || '参数校验失败');
      }
      validated[key] = omitUndefined(result.data);
    }

    req.validated = validated;
    next();
  };
}

module.exports = {
  validate
};
