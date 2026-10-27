const { success, fail } = require('../../utils/response');
const articleService = require('../../services/article.service');

//字段白名单
const EDITABLE_FIELDS = ['title', 'content', 'summary', 'author', 'status'];

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

// 只允许客户端提交可编辑字段，字段级校验统一交给模型
function pickArticleFields(body) {
  const source = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const payload = {};
  for (const field of EDITABLE_FIELDS) {
    if (source[field] !== undefined) {
      payload[field] = source[field];
    }
  }
  return payload;
}

/**
 * GET /api/admin/articles
 * 查询参数：
 *   page     页码，默认 1
 *   pageSize 每页条数，默认 10，最大 100
 *   title    标题模糊搜索
 *   keyword  标题/摘要模糊搜索
 *   status   draft | published
 */
async function listArticles(req, res, next) {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const pageSize = Math.min(toPositiveInt(req.query.pageSize, 10), 100);
    const title = String(req.query.title || '').trim();
    const keyword = String(req.query.keyword || '').trim();
    const status = String(req.query.status || '').trim();

    const { list, total } = await articleService.listArticles({
      page,
      pageSize,
      title,
      keyword,
      status
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
    const article = await articleService.createArticle(pickArticleFields(req.body));

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
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '文章 ID 无效');
    }

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
 * 更新单篇文章（仅更新请求体中提供的字段）
 * 请求体：
 *   title    选填，标题，最长 200 字
 *   content  选填，正文
 *   summary  选填，摘要，最长 500 字，传空字符串可清空
 *   author   选填，作者，最长 64 字，传空字符串恢复默认“匿名”
 *   status   选填，draft | published
 */
async function updateArticle(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '文章 ID 无效');
    }

    const payload = pickArticleFields(req.body);
    if (!Object.keys(payload).length) {
      return fail(res, 400, '没有需要更新的字段');
    }

    const article = await articleService.updateArticleById(id, payload);
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
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '文章 ID 无效');
    }

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
