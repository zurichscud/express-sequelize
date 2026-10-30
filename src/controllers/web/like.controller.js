const { success, successPage, fail } = require('../../utils/response');
const likeService = require('../../services/like.service');

/**
 * 从已校验的请求数据中解析课程 ID
 * 兼容路径参数 courseId / id、请求体 courseId 与查询参数 courseId
 * @param {import('express').Request} req
 * @returns {number|null}
 */
function resolveCourseId(req) {
  const { params = {}, body = {}, query = {} } = req.validated || {};
  const courseId = params.courseId ?? params.id ?? body.courseId ?? query.courseId;
  return Number.isInteger(courseId) && courseId > 0 ? courseId : null;
}

/**
 * POST /api/likes
 * 请求体：
 *   courseId 必填，课程 ID
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
 * 分页参数由 pagination.middleware.js 处理
 */
async function listLikedCourses(req, res, next) {
  try {
    const { list, total } = await likeService.listLikedCourses({
      userId: req.user.id,
      ...req.pagination
    });

    successPage(res, { list, total }, req.pagination);
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
