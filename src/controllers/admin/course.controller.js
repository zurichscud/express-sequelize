const { success, fail } = require('../../utils/response');
const courseService = require('../../services/course.service');

// 字段白名单（创建需要 user_id；更新不支持变更归属用户）
const CREATE_FIELDS = [
  'category_id',
  'user_id',
  'name',
  'image',
  'is_recommended',
  'content',
  'like_count',
  'chapter_count'
];
const UPDATE_FIELDS = [
  'category_id',
  'name',
  'image',
  'is_recommended',
  'content',
  'like_count',
  'chapter_count'
];

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

// 只允许客户端提交可编辑字段，字段级校验统一交给模型
function pickCourseFields(body, fields) {
  const source = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const payload = {};
  for (const field of fields) {
    if (source[field] !== undefined) {
      payload[field] = source[field];
    }
  }
  return payload;
}

/**
 * GET /api/admin/courses
 * 查询参数：
 *   page           页码，默认 1
 *   pageSize       每页条数，默认 10，最大 100
 *   category_id    按分类筛选
 *   user_id        按所属用户筛选
 *   is_recommended true/false，是否推荐
 *   keyword        课程名称模糊搜索
 */
async function listCourses(req, res, next) {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const pageSize = Math.min(toPositiveInt(req.query.pageSize, 10), 100);
    const categoryId = toPositiveInt(req.query.category_id, null);
    const userId = toPositiveInt(req.query.user_id, null);
    const isRecommended = String(req.query.is_recommended || '').trim();
    const keyword = String(req.query.keyword || '').trim();

    const { list, total } = await courseService.listCourses({
      page,
      pageSize,
      categoryId,
      userId,
      isRecommended,
      keyword
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
 * POST /api/admin/courses
 * 请求体：
 *   category_id    必填，分类 ID
 *   user_id        必填，所属用户 ID（创建者）
 *   name           必填，课程名称，最长 128 字
 *   image          选填，封面图片地址，最长 500 字
 *   is_recommended 选填，是否推荐，默认 false
 *   content        选填，课程内容
 *   like_count     选填，点赞数，默认 0
 *   chapter_count  选填，章节总数，默认 0
 */
async function createCourse(req, res, next) {
  try {
    const course = await courseService.createCourse(pickCourseFields(req.body, CREATE_FIELDS));

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
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '课程 ID 无效');
    }

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
 * 请求体：
 *   category_id    选填，分类 ID
 *   name           选填，课程名称，最长 128 字
 *   image          选填，封面图片地址，传空字符串可清空
 *   is_recommended 选填，是否推荐
 *   content        选填，课程内容
 *   like_count     选填，点赞数
 *   chapter_count  选填，章节总数
 */
async function updateCourse(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '课程 ID 无效');
    }

    const payload = pickCourseFields(req.body, UPDATE_FIELDS);
    if (!Object.keys(payload).length) {
      return fail(res, 400, '没有需要更新的字段');
    }

    const course = await courseService.updateCourseById(id, payload);
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
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '课程 ID 无效');
    }

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
