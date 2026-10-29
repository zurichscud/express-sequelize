const { success, successPage, fail } = require('../../utils/response');
const courseService = require('../../services/course.service');

/**
 * GET /api/admin/courses
 * 分页参数由 pagination.middleware.js 处理，其余查询参数由 course.validator.js 校验
 *   category_id    按分类筛选
 *   user_id        按所属用户筛选
 *   is_recommended true/false，是否推荐
 *   keyword        课程名称模糊搜索
 */
async function listCourses(req, res, next) {
  try {
    const { category_id, user_id, is_recommended, keyword } = req.validated.query;

    const { list, total } = await courseService.listCourses({
      ...req.pagination,
      categoryId: category_id,
      userId: user_id,
      isRecommended: is_recommended,
      keyword
    });

    successPage(res, { list, total }, req.pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/courses
 * 创建课程（请求体字段与格式由 course.validator.js 校验）
 *   category_id    必填，分类 ID
 *   user_id        必填，所属前台用户 ID（创建者，来自 app_users）
 *   name           必填，课程名称，最长 128 字
 *   image          选填，封面图片地址，最长 500 字
 *   is_recommended 选填，是否推荐，默认 false
 *   content        选填，课程内容
 *   like_count     选填，点赞数，默认 0
 *   chapter_count  只读，由章节接口自动维护
 */
async function createCourse(req, res, next) {
  try {
    const course = await courseService.createCourse(req.validated.body);

    success(res, course, { status: 201 });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/courses/:id
 * 查询单个课程详情（含分类与用户信息）
 */
async function getCourse(req, res, next) {
  try {
    const { id } = req.validated.params;

    const course = await courseService.getCourseById(id);
    if (!course) {
      return fail(res, 404, '课程不存在');
    }

    success(res, course);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/courses/:id
 * 更新课程（仅更新请求体中提供的字段；user_id 创建后不可变更）
 *   category_id    选填，分类 ID
 *   name           选填，课程名称，最长 128 字
 *   image          选填，封面图片地址，传空字符串可清空
 *   is_recommended 选填，是否推荐
 *   content        选填，课程内容
 *   like_count     选填，点赞数
 *   chapter_count  只读，由章节接口自动维护
 */
async function updateCourse(req, res, next) {
  try {
    const { id } = req.validated.params;

    const course = await courseService.updateCourseById(id, req.validated.body);
    if (!course) {
      return fail(res, 404, '课程不存在');
    }

    success(res, course);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/courses/:id
 * 删除单个课程
 */
async function deleteCourse(req, res, next) {
  try {
    const { id } = req.validated.params;

    const deleted = await courseService.deleteCourseById(id);
    if (!deleted) {
      return fail(res, 404, '课程不存在');
    }

    success(res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse
};
