const { success, successPage, fail } = require('../../utils/response');
const articleService = require('../../services/article.service');

/**
 * GET /api/articles
 * 前台文章列表，仅返回已发布文章
 * 分页参数由 pagination.middleware.js 处理，其余查询参数由 article.validator.js 校验
 *   keyword  标题 / 摘要模糊搜索
 *   sort     latest（默认）| hot，hot 按浏览量倒序
 */
async function listArticles(req, res, next) {
  try {
    const { keyword, sort } = req.validated.query;

    const { list, total } = await articleService.listArticles({
      ...req.pagination,
      keyword,
      sort,
      status: 'published'
    });

    successPage(res, { list, total }, req.pagination);
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
    const { id } = req.validated.params;

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
