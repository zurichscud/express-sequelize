const { success, successPage, fail } = require('../../utils/response');
const courseService = require('../../services/course.service');
const chapterService = require('../../services/chapter.service');

/**
 * GET /api/courses
 * 前台课程列表
 * 分页参数由 pagination.middleware.js 处理，其余查询参数由 course.validator.js 校验
 *   categoryId    按分类筛选
 *   isRecommended true/false，是否推荐
 *   keyword        课程名称模糊搜索
 */
async function listCourses(req, res, next) {
  try {
    const { categoryId, isRecommended, keyword } = req.validated.query;

    const { list, total } = await courseService.listCourses({
      ...req.pagination,
      categoryId,
      isRecommended,
      keyword,
      withContent: true
    });

    successPage(res, { list, total }, req.pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/courses/:id
 * 前台课程详情（含分类、作者与章节目录，章节正文由章节详情接口获取）
 */
async function getCourse(req, res, next) {
  try {
    const { id } = req.validated.params;

    const course = await courseService.getCourseById(id);
    if (!course) {
      return fail(res, 404, '课程不存在');
    }

    const chapters = await chapterService.listCourseChapters(id);
    success(res, {
      ...course.toJSON(),
      chapters
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCourses,
  getCourse
};
