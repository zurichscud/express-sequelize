const { success, fail } = require('../../utils/response');
const articleService = require('../../services/article.service');

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * GET /api/articles
 * 前台文章列表，仅返回已发布文章
 * 查询参数：
 *   page     页码，默认 1
 *   pageSize 每页条数，默认 10，最大 50
 *   keyword  标题 / 摘要模糊搜索
 *   sort     latest（默认）| hot，hot 按浏览量倒序
 */
async function listArticles(req, res, next) {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const pageSize = Math.min(toPositiveInt(req.query.pageSize, 10), 50);
    const keyword = String(req.query.keyword || '').trim();
    const sort = String(req.query.sort || '').trim();

    const { list, total } = await articleService.listArticles({
      page,
      pageSize,
      keyword,
      sort,
      status: 'published'
    });

    success(res, {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/articles/:id
 * 前台文章详情，仅已发布文章可访问，访问时浏览量 +1
 */
async function getArticle(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '文章 ID 无效');
    }

    const article = await articleService.getPublishedArticleDetail(id);
    if (!article) {
      return fail(res, 404, '文章不存在');
    }

    success(res, article);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listArticles,
  getArticle
};
