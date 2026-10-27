const { success, fail } = require('../../utils/response');
const chapterService = require('../../services/chapter.service');

// 字段白名单，字段级校验统一交给模型
const CREATE_FIELDS = ['course_id', 'title', 'content', 'video_url', 'rank'];
const UPDATE_FIELDS = ['course_id', 'title', 'content', 'video_url', 'rank'];

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

// 只允许客户端提交可编辑字段
function pickChapterFields(body, fields) {
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
 * GET /api/admin/chapters
 * 查询参数：
 *   page       页码，默认 1
 *   pageSize   每页条数，默认 10，最大 100
 *   course_id  按所属课程筛选
 *   keyword    章节标题模糊搜索
 */
async function listChapters(req, res, next) {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const pageSize = Math.min(toPositiveInt(req.query.pageSize, 10), 100);
    const courseId = toPositiveInt(req.query.course_id, null);
    const keyword = String(req.query.keyword || '').trim();

    const { list, total } = await chapterService.listChapters({
      page,
      pageSize,
      courseId,
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
 * POST /api/admin/chapters
 * 请求体：
 *   course_id  必填，所属课程 ID
 *   title      必填，章节标题，最长 200 字
 *   content    选填，章节内容
 *   video_url  选填，视频地址，最长 500 字
 *   rank       选填，排序序号，默认 0，越小越靠前
 */
async function createChapter(req, res, next) {
  try {
    const chapter = await chapterService.createChapter(pickChapterFields(req.body, CREATE_FIELDS));

    success(res, chapter, { status: 201 });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/chapters/:id
 * 查询单个章节详情（含所属课程信息）
 */
async function getChapter(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '章节 ID 无效');
    }

    const chapter = await chapterService.getChapterById(id);
    if (!chapter) {
      return fail(res, 404, '章节不存在');
    }

    success(res, chapter);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/chapters/:id
 * 更新章节（仅更新请求体中提供的字段）
 * 请求体：
 *   course_id  选填，所属课程 ID
 *   title      选填，章节标题
 *   content    选填，章节内容
 *   video_url  选填，视频地址，传空字符串可清空
 *   rank       选填，排序序号
 */
async function updateChapter(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '章节 ID 无效');
    }

    const payload = pickChapterFields(req.body, UPDATE_FIELDS);
    if (!Object.keys(payload).length) {
      return fail(res, 400, '没有需要更新的字段');
    }

    const chapter = await chapterService.updateChapterById(id, payload);
    if (!chapter) {
      return fail(res, 404, '章节不存在');
    }

    success(res, chapter);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/chapters/:id
 * 删除单个章节
 */
async function deleteChapter(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '章节 ID 无效');
    }

    const deleted = await chapterService.deleteChapterById(id);
    if (!deleted) {
      return fail(res, 404, '章节不存在');
    }

    success(res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listChapters,
  createChapter,
  getChapter,
  updateChapter,
  deleteChapter
};
