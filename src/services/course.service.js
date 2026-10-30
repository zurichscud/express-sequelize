const { Op } = require('sequelize');
const { Category, Course, AppUser } = require('../models');

// 列表不返回 content 正文，减少传输体积
const LIST_ATTRIBUTES = [
  'id',
  'categoryId',
  'userId',
  'name',
  'image',
  'isRecommended',
  'likeCount',
  'chapterCount',
  'createdAt',
  'updatedAt'
];

// 关联查询只取必要字段，避免泄漏用户敏感信息
const CATEGORY_INCLUDE = { model: Category, as: 'category', attributes: ['id', 'name', 'rank'] };
const USER_INCLUDE = { model: AppUser, as: 'user', attributes: ['id', 'username', 'nickname'] };

/**
 * 校验外键对应的记录是否存在，不存在时抛出 400 业务错误
 * @param {number|string} categoryId
 * @param {number|string} [userId]
 */
async function assertRefsExist(categoryId, userId) {
  if (categoryId != null && !(await Category.findByPk(categoryId))) {
    const businessError = new Error('分类不存在');
    businessError.status = 400;
    throw businessError;
  }
  if (userId != null && !(await AppUser.findByPk(userId))) {
    const businessError = new Error('用户不存在');
    businessError.status = 400;
    throw businessError;
  }
}

/**
 * 分页查询课程列表
 * @param {{ offset: number, limit: number, categoryId?: number, userId?: number, isRecommended?: string, keyword?: string, withContent?: boolean }} options
 * @returns {Promise<{ list: object[], total: number }>}
 */
async function listCourses({
  offset,
  limit,
  categoryId,
  userId,
  isRecommended,
  keyword,
  withContent = false
}) {
  const where = {};
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (userId) {
    where.userId = userId;
  }
  if (isRecommended === 'true' || isRecommended === '1') {
    where.isRecommended = true;
  } else if (isRecommended === 'false' || isRecommended === '0') {
    where.isRecommended = false;
  }
  if (keyword) {
    where.name = { [Op.like]: `%${keyword}%` };
  }

  const { count, rows } = await Course.findAndCountAll({
    where,
    // 前台需要展示课程简介，后台列表仍保持精简
    attributes: withContent ? [...LIST_ATTRIBUTES, 'content'] : LIST_ATTRIBUTES,
    include: [CATEGORY_INCLUDE, USER_INCLUDE],
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC']
    ],
    offset,
    limit
  });

  return { list: rows, total: count };
}

/**
 * 按 ID 查询课程详情（含分类与用户信息）
 * @param {number|string} id
 */
async function getCourseById(id) {
  return Course.findByPk(id, { include: [CATEGORY_INCLUDE, USER_INCLUDE] });
}

/**
 * 创建课程（校验分类与用户存在，外键在数据库层面也有约束）
 * @param {object} data
 */
async function createCourse(data) {
  await assertRefsExist(data.categoryId, data.userId);
  return Course.create(data);
}

/**
 * 按 ID 更新课程（仅更新传入字段；userId 创建后不可变更）
 * @param {number|string} id
 * @param {object} data
 * @returns {Promise<object|null>} 课程不存在时返回 null
 */
async function updateCourseById(id, data) {
  const course = await Course.findByPk(id);
  if (!course) {
    return null;
  }

  if (data.categoryId !== undefined) {
    await assertRefsExist(data.categoryId);
  }
  await course.update(data);
  return getCourseById(id);
}

/**
 * 按 ID 删除课程
 * @param {number|string} id
 * @returns {Promise<boolean>} 课程不存在时返回 false
 */
async function deleteCourseById(id) {
  const course = await Course.findByPk(id);
  if (!course) {
    return false;
  }

  await course.destroy();
  return true;
}

module.exports = {
  listCourses,
  getCourseById,
  createCourse,
  updateCourseById,
  deleteCourseById
};
