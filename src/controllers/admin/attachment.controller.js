const { success, fail } = require('../../utils/response');
const attachmentService = require('../../services/attachment.service');

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * GET /api/admin/attachments
 * 查询参数：
 *   page     页码，默认 1
 *   pageSize 每页条数，默认 10，最大 100
 *   keyword  文件名 / OSS Key / 地址模糊搜索
 *   type     image | video
 */
async function listAttachments(req, res, next) {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const pageSize = Math.min(toPositiveInt(req.query.pageSize, 10), 100);
    const keyword = String(req.query.keyword || '').trim();
    const type = String(req.query.type || '').trim();

    const { list, total } = await attachmentService.listAttachments({
      page,
      pageSize,
      keyword,
      type
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
 * DELETE /api/admin/attachments/:id
 * 删除附件记录并同步删除 OSS 文件
 */
async function deleteAttachment(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '附件 ID 无效');
    }

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
