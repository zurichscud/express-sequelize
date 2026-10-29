const { Router } = require('express');
const {
  listAttachments,
  deleteAttachment
} = require('../../controllers/admin/attachment.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { pagination } = require('../../middlewares/pagination.middleware');
const {
  attachmentIdParamsSchema,
  listAttachmentsQuerySchema
} = require('../../validators/attachment.validator');

const router = Router();

router.get(
  '/',
  pagination(),
  validate({ query: listAttachmentsQuerySchema }),
  listAttachments
);
router.delete('/:id', validate({ params: attachmentIdParamsSchema }), deleteAttachment);

module.exports = router;
