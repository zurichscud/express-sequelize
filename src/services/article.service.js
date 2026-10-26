const { Op } = require('sequelize');
const { Article } = require('../models');

const STATUSES = ['draft', 'published'];

/**
 * 分页查询文章列表
 * @param {{ page: number, pageSize: number, title?: string, keyword?: string, status?: string }} options
 * @returns {Promise<{ list: object[], total: number }>}
 */
async function listArticles({ page, pageSize, title, keyword, status }) {
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

  const { count, rows } = await Article.findAndCountAll({
    where,
    // 列表不返回正文，减少传输体积
    attributes: ['id', 'title', 'summary', 'author', 'status', 'views', 'createdAt', 'updatedAt'],
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC']
    ],
    offset: (page - 1) * pageSize,
    limit: pageSize
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
  createArticle,
  updateArticleById,
  deleteArticleById
};
