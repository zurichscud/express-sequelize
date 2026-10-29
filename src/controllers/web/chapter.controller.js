const { success, successPage, fail } = require('../../utils/response');
const chapterService = require('../../services/chapter.service');

/**
 * GET /api/chapters
 * 前台章节列表，按 rank 升序、id 升序，列表不返回 content 正文
 * 分页参数由 pagination.middleware.js 处理，其余查询参数由 chapter.validator.js 校验
 *   course_id 按所属课程筛选
 *   keyword   章节标题模糊搜索
 */
async function listChapters(req, res, next) {
  try {
    const { course_id, keyword } = req.validated.query;

    const { list, total } = await chapterService.listChapters({
      ...req.pagination,
      courseId: course_id,
      keyword
    });

    successPage(res, { list, total }, req.pagination);
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
    const { id } = req.validated.params;

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
