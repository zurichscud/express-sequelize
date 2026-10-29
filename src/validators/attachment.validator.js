const { z } = require('zod');
const { idParam, queryText, queryEnum } = require('./common');

const attachmentIdParamsSchema = z.object({ id: idParam('附件') });

const listAttachmentsQuerySchema = z.object({
  keyword: queryText('搜索关键词', 200),
  type: queryEnum(['image', 'video'], '附件类型只能是 image 或 video')
});

module.exports = {
  attachmentIdParamsSchema,
  listAttachmentsQuerySchema
};
