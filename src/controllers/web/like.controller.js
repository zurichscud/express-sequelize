const { success, fail } = require('../../utils/response');
const likeService = require('../../services/like.service');

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * 解析课程 ID，支持路径参数 courseId 与请求体 course_id
 * @param {import('express').Request} req
 * @returns {number|null}
 */
function resolveCourseId(req) {
  const bodyCourseId = req.body && typeof req.body === 'object' ? req.body.course_id : undefined;
  const source = req.params.courseId ?? req.params.id ?? bodyCourseId ?? req.query.course_id;
  const raw = String(source ?? '').trim();
  if (!/^\d+$/.test(raw) || Number(raw) <= 0) {
    return null;
  }
  return Number(raw);
}

/**
 * POST /api/likes
 * 请求体：
 *   course_id 必填，课程 ID
 * 已经点过赞时幂等返回当前状态
 */
async function likeCourse(req, res, next) {
  try {
    const courseId = resolveCourseId(req);
    if (!courseId) {
      return fail(res, 400, '课程 ID 无效');
    }

    const data = await likeService.likeCourse(req.user.id, courseId);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/likes/:courseId
 * 取消点赞，未点赞时幂等返回当前状态
 */
async function unlikeCourse(req, res, next) {
  try {
    const courseId = resolveCourseId(req);
    if (!courseId) {
      return fail(res, 400, '课程 ID 无效');
    }

    const data = await likeService.unlikeCourse(req.user.id, courseId);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/likes/:courseId
 * 查询当前用户对该课程的点赞状态与课程总点赞数
 */
async function getLikeStatus(req, res, next) {
  try {
    const courseId = resolveCourseId(req);
    if (!courseId) {
      return fail(res, 400, '课程 ID 无效');
    }

    const data = await likeService.getLikeStatus(req.user.id, courseId);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/likes
 * 分页查询当前用户点赞过的课程
 * 查询参数：
 *   page     页码，默认 1
 *   pageSize 每页条数，默认 10，最大 50
 */
async function listLikedCourses(req, res, next) {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const pageSize = Math.min(toPositiveInt(req.query.pageSize, 10), 50);

    const { list, total } = await likeService.listLikedCourses({
      userId: req.user.id,
      page,
      pageSize
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

module.exports = {
  likeCourse,
  unlikeCourse,
  getLikeStatus,
  listLikedCourses
};
