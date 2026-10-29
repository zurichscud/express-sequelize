const { z } = require('zod');
const { fail } = require('../utils/response');

// 列表默认每页 10 条，单页上限 100 条，路由可按需覆盖
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

// 查询字符串里的空值统一按“未传”处理，避免 ?page= 被当成 0
const emptyToUndefined = (value) => (value === '' || value === null ? undefined : value);

/**
 * 查询参数中的正整数，缺省时使用 fallback，超过 max 时按 max 截断
 * @param {string} label
 * @param {number} fallback
 * @param {number} [max]
 */
function positiveIntQuery(label, fallback, max) {
  return z
    .preprocess(
      emptyToUndefined,
      z.coerce
        .number({ error: `${label}无效` })
        .int(`${label}无效`)
        .positive(`${label}无效`)
        .optional()
    )
    .transform((value) => {
      const resolved = value ?? fallback;
      return max === undefined ? resolved : Math.min(resolved, max);
    });
}

/**
 * 分页中间件：校验 page / pageSize，并把分页结果挂到 req.pagination
 * 控制器用 offset / limit 查库，用 page / pageSize 组装响应
 * @param {{ defaultPageSize?: number, maxPageSize?: number }} [options]
 * @returns {import('express').RequestHandler}
 */
function pagination({ defaultPageSize = DEFAULT_PAGE_SIZE, maxPageSize = MAX_PAGE_SIZE } = {}) {
  const schema = z.object({
    page: positiveIntQuery('页码', 1),
    pageSize: positiveIntQuery('每页条数', defaultPageSize, maxPageSize)
  });

  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return fail(res, 400, result.error.issues[0].message);
    }

    const { page, pageSize } = result.data;
    req.pagination = {
      page,
      pageSize,
      offset: (page - 1) * pageSize,
      limit: pageSize
    };
    next();
  };
}

module.exports = {
  pagination
};
