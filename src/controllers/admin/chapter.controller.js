const { success, successPage, fail } = require('../../utils/response');
const chapterService = require('../../services/chapter.service');

/**
 * GET /api/admin/chapters
 * 分页参数由 pagination.middleware.js 处理，其余查询参数由 chapter.validator.js 校验
 *   courseId  按所属课程筛选
 *   keyword    章节标题模糊搜索
 */
async function listChapters(req, res, next) {
  try {
    const { courseId, keyword } = req.validated.query;

    const { list, total } = await chapterService.listChapters({
      ...req.pagination,
      courseId,
      keyword
    });

    successPage(res, { list, total }, req.pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/chapters
 * 创建章节（请求体字段与格式由 chapter.validator.js 校验）
 *   courseId  必填，所属课程 ID
 *   title      必填，章节标题，最长 200 字
 *   content    选填，章节内容
 *   videoUrl  选填，视频地址，最长 500 字
 *   rank       选填，排序序号，默认 0，越小越靠前
 */
async function createChapter(req, res, next) {
  try {
    const chapter = await chapterService.createChapter(req.validated.body);

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

/**
 * PUT /api/admin/chapters/:id
 * 更新章节（仅更新请求体中提供的字段）
 *   courseId  选填，所属课程 ID
 *   title      选填，章节标题
 *   content    选填，章节内容
 *   videoUrl  选填，视频地址，传空字符串可清空
 *   rank       选填，排序序号
 */
async function updateChapter(req, res, next) {
  try {
    const { id } = req.validated.params;

    const chapter = await chapterService.updateChapterById(id, req.validated.body);
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
    const { id } = req.validated.params;

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
