const { Op } = require('sequelize');
const { Chapter, Course, sequelize } = require('../models');

// 列表不返回 content 正文，减少传输体积
const LIST_ATTRIBUTES = [
  'id',
  'courseId',
  'title',
  'videoUrl',
  'rank',
  'createdAt',
  'updatedAt'
];

// 关联查询只取必要字段
const COURSE_INCLUDE = { model: Course, as: 'course', attributes: ['id', 'name'] };

/**
 * 锁定课程行，确保章节增删与课程 chapterCount 更新串行执行
 * 课程不存在时抛出 400 业务错误
 * @param {number|string} courseId
 * @param {import('sequelize').Transaction} transaction
 */
async function lockCourse(courseId, transaction) {
  const course = await Course.findByPk(courseId, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  if (!course) {
    const businessError = new Error('课程不存在');
    businessError.status = 400;
    throw businessError;
  }
  return course;
}

/**
 * 按 chapters 实际数量回写课程 chapterCount
 * @param {number|string} courseId
 * @param {import('sequelize').Transaction} transaction
 */
async function syncCourseChapterCount(courseId, transaction) {
  const chapterCount = await Chapter.count({
    where: { courseId },
    transaction
  });
  await Course.update(
    { chapterCount },
    { where: { id: courseId }, transaction }
  );
}

/**
 * 分页查询章节列表，按 rank 升序、id 升序
 * @param {{ offset: number, limit: number, courseId?: number, keyword?: string }} options
 * @returns {Promise<{ list: object[], total: number }>}
 */
async function listChapters({ offset, limit, courseId, keyword }) {
  const where = {};
  if (courseId) {
    where.courseId = courseId;
  }
  if (keyword) {
    where.title = { [Op.like]: `%${keyword}%` };
  }

  const { count, rows } = await Chapter.findAndCountAll({
    where,
    attributes: LIST_ATTRIBUTES,
    include: [COURSE_INCLUDE],
    order: [
      ['rank', 'ASC'],
      ['id', 'ASC']
    ],
    offset,
    limit
  });

  return { list: rows, total: count };
}

/**
 * 按 ID 查询章节详情（含所属课程信息）
 * @param {number|string} id
 */
async function getChapterById(id) {
  return Chapter.findByPk(id, { include: [COURSE_INCLUDE] });
}

/**
 * 查询某门课程下的全部章节，按 rank 升序、id 升序
 * 前台课程详情使用，不返回 content 正文，正文由章节详情接口单独获取
 * @param {number|string} courseId
 * @returns {Promise<object[]>}
 */
async function listCourseChapters(courseId) {
  return Chapter.findAll({
    where: { courseId },
    attributes: ['id', 'courseId', 'title', 'videoUrl', 'rank', 'createdAt', 'updatedAt'],
    order: [
      ['rank', 'ASC'],
      ['id', 'ASC']
    ]
  });
}

/**
 * 创建章节（校验课程存在，并在同一事务内同步课程 chapterCount）
 * @param {object} data
 */
async function createChapter(data) {
  return sequelize.transaction(async (transaction) => {
    if (data.courseId !== undefined) {
      await lockCourse(data.courseId, transaction);
    }

    const chapter = await Chapter.create(data, { transaction });

    if (data.courseId !== undefined) {
      await syncCourseChapterCount(data.courseId, transaction);
    }
    return chapter;
  });
}

/**
 * 按 ID 更新章节（仅更新传入字段；变更课程时同时同步两门课程的 chapterCount）
 * @param {number|string} id
 * @param {object} data
 * @returns {Promise<object|null>} 章节不存在时返回 null
 */
async function updateChapterById(id, data) {
  const chapterId = await sequelize.transaction(async (transaction) => {
    const chapter = await Chapter.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    if (!chapter) {
      return null;
    }

    const oldCourseId = chapter.courseId;
    const newCourseId = data.courseId !== undefined ? data.courseId : oldCourseId;

    // 涉及两门课程时按 ID 升序加锁，避免并发迁移章节时互相死锁
    const courseIds = [...new Set([String(oldCourseId), String(newCourseId)])].sort(
      (a, b) => Number(a) - Number(b)
    );
    for (const courseId of courseIds) {
      await lockCourse(courseId, transaction);
    }

    await chapter.update(data, { transaction });
    await syncCourseChapterCount(oldCourseId, transaction);
    if (Number(newCourseId) !== Number(oldCourseId)) {
      await syncCourseChapterCount(newCourseId, transaction);
    }
    return chapter.id;
  });

  return chapterId ? getChapterById(chapterId) : null;
}

/**
 * 按 ID 删除章节（在同一事务内同步课程 chapterCount）
 * @param {number|string} id
 * @returns {Promise<boolean>} 章节不存在时返回 false
 */
async function deleteChapterById(id) {
  return sequelize.transaction(async (transaction) => {
    const chapter = await Chapter.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    if (!chapter) {
      return false;
    }

    await lockCourse(chapter.courseId, transaction);
    await chapter.destroy({ transaction });
    await syncCourseChapterCount(chapter.courseId, transaction);
    return true;
  });
}

module.exports = {
  listChapters,
  getChapterById,
  listCourseChapters,
  createChapter,
  updateChapterById,
  deleteChapterById
};
