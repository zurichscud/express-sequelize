const { success, fail } = require('../../utils/response');
const chapterService = require('../../services/chapter.service');

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * GET /api/chapters
 * 前台章节列表，按 rank 升序、id 升序，列表不返回 content 正文
 * 查询参数：
 *   page      页码，默认 1
 *   pageSize  每页条数，默认 20，最大 100
 *   course_id 按所属课程筛选
 *   keyword   章节标题模糊搜索
 */
async function listChapters(req, res, next) {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const pageSize = Math.min(toPositiveInt(req.query.pageSize, 20), 100);
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
 * GET /api/chapters/:id
 * 前台章节详情（含正文与所属课程），供课程详情页按需加载
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

module.exports = {
  listChapters,
  getChapter
};
