const { Op } = require('sequelize');
const { Article } = require('../models');

const STATUSES = ['draft', 'published'];

/**
 * 分页查询文章列表
 * @param {{ offset: number, limit: number, title?: string, keyword?: string, status?: string, sort?: string }} options
 *   sort 为 hot/views 时按浏览量倒序，其余按创建时间倒序
 * @returns {Promise<{ list: object[], total: number }>}
 */
async function listArticles({ offset, limit, title, keyword, status, sort }) {
  const where = {};
  if (STATUSES.includes(status)) {
    where.status = status;
  }
  if (title) {
    where.title = { [Op.like]: `%${title}%` };
  }
  if (keyword) {
    where[Op.or] = [
      { title: { [Op.like]: `%${keyword}%` } },
      { summary: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const order =
    sort === 'hot' || sort === 'views'
      ? [
          ['views', 'DESC'],
          ['createdAt', 'DESC'],
          ['id', 'DESC']
        ]
      : [
          ['createdAt', 'DESC'],
          ['id', 'DESC']
        ];

  const { count, rows } = await Article.findAndCountAll({
    where,
    // 列表不返回正文，减少传输体积
    attributes: ['id', 'title', 'summary', 'author', 'status', 'views', 'createdAt', 'updatedAt'],
    order,
    offset,
    limit
  });

  return { list: rows, total: count };
}

/**
 * 按 ID 查询文章详情
 * @param {number|string} id
 */
async function getArticleById(id) {
  return Article.findByPk(id);
}

/**
 * 前台查询已发布文章详情，并累加一次浏览量
 * 草稿或文章不存在时统一返回 null，避免暴露草稿状态
 * @param {number|string} id
 * @returns {Promise<object|null>}
 */
async function getPublishedArticleDetail(id) {
  const article = await Article.findByPk(id);
  if (!article || article.status !== 'published') {
    return null;
  }

  // silent 避免浏览量变化刷新 updatedAt，保持“最后编辑时间”语义
  await article.increment('views', { silent: true });
  // increment 是数据库层自增，重新读取以返回最新浏览量
  await article.reload();
  return article;
}

/**
 * 创建文章
 * @param {object} data
 */
async function createArticle(data) {
  return Article.create(data);
}

/**
 * 按 ID 更新文章
 * @param {number|string} id
 * @param {object} data
 * @returns {Promise<object|null>} 文章不存在时返回 null
 */
async function updateArticleById(id, data) {
  const article = await Article.findByPk(id);
  if (!article) {
    return null;
  }

  await article.update(data);
  return article;
}

/**
 * 按 ID 删除文章
 * @param {number|string} id
 * @returns {Promise<boolean>} 文章不存在时返回 false
 */
async function deleteArticleById(id) {
  const article = await Article.findByPk(id);
  if (!article) {
    return false;
  }

  await article.destroy();
  return true;
}

module.exports = {
  listArticles,
  getArticleById,
  getPublishedArticleDetail,
  createArticle,
  updateArticleById,
  deleteArticleById
};
