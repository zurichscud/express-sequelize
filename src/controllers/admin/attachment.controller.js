const { success, successPage, fail } = require('../../utils/response');
const attachmentService = require('../../services/attachment.service');

/**
 * GET /api/admin/attachments
 * 分页参数由 pagination.middleware.js 处理，其余查询参数由 attachment.validator.js 校验
 *   keyword  文件名 / OSS Key / 地址模糊搜索
 *   type     image | video
 */
async function listAttachments(req, res, next) {
  try {
    const { keyword, type } = req.validated.query;

    const { list, total } = await attachmentService.listAttachments({
      ...req.pagination,
      keyword,
      type
    });

    successPage(res, { list, total }, req.pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/attachments/:id
 * 删除附件记录并同步删除 OSS 文件
 */
async function deleteAttachment(req, res, next) {
  try {
    const { id } = req.validated.params;

    const deleted = await attachmentService.deleteAttachmentById(id);
    if (!deleted) {
      return fail(res, 404, '附件不存在');
    }

    success(res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAttachments,
  deleteAttachment
};
