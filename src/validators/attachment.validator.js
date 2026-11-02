const { z } = require('zod');
const { idParam, queryText, queryIntEnum } = require('./common');
const { ATTACHMENT_TYPES } = require('../constants/enums');

const attachmentIdParamsSchema = z.object({ id: idParam('附件') });

const listAttachmentsQuerySchema = z.object({
  keyword: queryText('搜索关键词', 200),
  type: queryIntEnum(ATTACHMENT_TYPES, '附件类型只能是 0（图片）或 1（视频）')
});

module.exports = {
  attachmentIdParamsSchema,
  listAttachmentsQuerySchema
};
