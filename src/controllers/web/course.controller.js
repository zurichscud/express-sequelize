const { success, fail } = require('../../utils/response');
const courseService = require('../../services/course.service');
const chapterService = require('../../services/chapter.service');

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * GET /api/courses
 * 前台课程列表
 * 查询参数：
 *   page           页码，默认 1
 *   pageSize       每页条数，默认 12，最大 60
 *   category_id    按分类筛选
 *   is_recommended true/false，是否推荐
 *   keyword        课程名称模糊搜索
 */
async function listCourses(req, res, next) {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const pageSize = Math.min(toPositiveInt(req.query.pageSize, 12), 60);
    const categoryId = toPositiveInt(req.query.category_id, null);
    const isRecommended = String(req.query.is_recommended || '').trim();
    const keyword = String(req.query.keyword || '').trim();

    const { list, total } = await courseService.listCourses({
      page,
      pageSize,
      categoryId,
      isRecommended,
      keyword,
      withContent: true
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
 * GET /api/courses/:id
 * 前台课程详情（含分类、作者与章节目录，章节正文由章节详情接口获取）
 */
async function getCourse(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '课程 ID 无效');
    }

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
