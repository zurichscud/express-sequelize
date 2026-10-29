const { success, successPage, fail } = require('../../utils/response');
const articleService = require('../../services/article.service');

/**
 * GET /api/admin/articles
 * 分页参数由 pagination.middleware.js 处理，其余查询参数由 article.validator.js 校验
 *   title    标题模糊搜索
 *   keyword  标题/摘要模糊搜索
 *   status   draft | published
 */
async function listArticles(req, res, next) {
  try {
    const { title, keyword, status } = req.validated.query;

    const { list, total } = await articleService.listArticles({
      ...req.pagination,
      title,
      keyword,
      status
    });

    successPage(res, { list, total }, req.pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/articles
 * 请求体：
 *   title    必填，标题，最长 200 字
 *   content  必填，正文
 *   summary  选填，摘要，最长 500 字
 *   author   选填，作者，最长 64 字，默认“匿名”
 *   status   选填，draft | published，默认 published
 */
async function createArticle(req, res, next) {
  try {
    const article = await articleService.createArticle(req.validated.body);

    success(res, article, { status: 201 });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/articles/:id
 * 查询单篇文章详情（包含正文）
 */
async function getArticle(req, res, next) {
  try {
    const { id } = req.validated.params;

    const article = await articleService.getArticleById(id);
    if (!article) {
      return fail(res, 404, '文章不存在');
    }

    success(res, article);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/articles/:id
 * 更新单篇文章（仅更新请求体中提供的字段，空请求体由 schema 拦截）
 * 请求体：
 *   title    选填，标题，最长 200 字
 *   content  选填，正文
 *   summary  选填，摘要，最长 500 字，传空字符串可清空
 *   author   选填，作者，最长 64 字，传空字符串恢复默认“匿名”
 *   status   选填，draft | published
 */
async function updateArticle(req, res, next) {
  try {
    const { id } = req.validated.params;

    const article = await articleService.updateArticleById(id, req.validated.body);
    if (!article) {
      return fail(res, 404, '文章不存在');
    }

    success(res, article);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/articles/:id
 * 删除单篇文章
 */
async function deleteArticle(req, res, next) {
  try {
    const { id } = req.validated.params;

    const deleted = await articleService.deleteArticleById(id);
    if (!deleted) {
      return fail(res, 404, '文章不存在');
    }

    success(res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listArticles,
  createArticle,
  getArticle,
  updateArticle,
  deleteArticle
};
