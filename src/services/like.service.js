const { Op, UniqueConstraintError } = require('sequelize');
const { Category, Course, Like, AppUser } = require('../models');

// 返回给前台的课程字段，与前台课程列表保持一致（含 content 供简介展示）
const COURSE_ATTRIBUTES = [
  'id',
  'category_id',
  'user_id',
  'name',
  'image',
  'is_recommended',
  'content',
  'like_count',
  'chapter_count',
  'createdAt',
  'updatedAt'
];
const CATEGORY_INCLUDE = { model: Category, as: 'category', attributes: ['id', 'name', 'rank'] };
const USER_INCLUDE = { model: AppUser, as: 'user', attributes: ['id', 'username', 'nickname'] };

/**
 * 校验课程是否存在，不存在时抛出 404 业务错误
 * @param {number|string} courseId
 * @returns {Promise<object>}
 */
async function getCourseOrThrow(courseId) {
  const course = await Course.findByPk(courseId);
  if (!course) {
    const businessError = new Error('课程不存在');
    businessError.status = 404;
    throw businessError;
  }
  return course;
}

/**
 * 点赞课程（幂等：已经点过赞不会重复累加）
 * @param {number|string} userId
 * @param {number|string} courseId
 * @returns {Promise<{ liked: boolean, like_count: number }>}
 */
async function likeCourse(userId, courseId) {
  const course = await getCourseOrThrow(courseId);

  let created = false;
  try {
    const [, isCreated] = await Like.findOrCreate({
      where: { user_id: userId, course_id: courseId }
    });
    created = isCreated;
  } catch (err) {
    // 并发重复点赞会命中唯一索引，视为已点赞即可
    if (!(err instanceof UniqueConstraintError)) {
      throw err;
    }
  }

  if (created) {
    // silent 避免点赞数变化刷新课程 updatedAt
    await course.increment('like_count', { silent: true });
    await course.reload();
  }

  return { liked: true, like_count: Number(course.like_count) };
}

/**
 * 取消点赞（幂等：未点赞时直接返回当前状态）
 * @param {number|string} userId
 * @param {number|string} courseId
 * @returns {Promise<{ liked: boolean, like_count: number }>}
 */
async function unlikeCourse(userId, courseId) {
  const course = await getCourseOrThrow(courseId);

  const like = await Like.findOne({ where: { user_id: userId, course_id: courseId } });
  if (like) {
    await like.destroy();
    // 加上 like_count > 0 条件，避免历史脏数据导致无符号字段减成负数
    await Course.decrement('like_count', {
      by: 1,
      where: { id: courseId, like_count: { [Op.gt]: 0 } },
      silent: true
    });
    await course.reload();
  }

  return { liked: false, like_count: Number(course.like_count) };
}

/**
 * 查询当前用户对某门课程的点赞状态
 * @param {number|string} userId
 * @param {number|string} courseId
 * @returns {Promise<{ liked: boolean, like_count: number }>}
 */
async function getLikeStatus(userId, courseId) {
  const course = await getCourseOrThrow(courseId);
  const like = await Like.findOne({
    where: { user_id: userId, course_id: courseId },
    attributes: ['id']
  });

  return { liked: Boolean(like), like_count: Number(course.like_count) };
}

/**
 * 分页查询当前用户点赞过的课程，按点赞时间倒序
 * @param {{ userId: number|string, offset: number, limit: number }} options
 * @returns {Promise<{ list: object[], total: number }>}
 */
async function listLikedCourses({ userId, offset, limit }) {
  const { count, rows } = await Like.findAndCountAll({
    where: { user_id: userId },
    attributes: ['id', 'course_id', 'createdAt'],
    include: [
      {
        model: Course,
        as: 'course',
        attributes: COURSE_ATTRIBUTES,
        include: [CATEGORY_INCLUDE, USER_INCLUDE]
      }
    ],
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC']
    ],
    offset,
    limit,
    distinct: true
  });

  const list = rows
    .filter((row) => row.course)
    .map((row) => ({
      ...row.course.get({ plain: true }),
      // 点赞时间用于前端展示“最近点赞”排序
      likedAt: row.createdAt
    }));

  return { list, total: count };
}

module.exports = {
  likeCourse,
  unlikeCourse,
  getLikeStatus,
  listLikedCourses
};
