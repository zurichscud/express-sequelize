const { Router } = require('express');
const {
  listAttachments,
  deleteAttachment
} = require('../../controllers/admin/attachment.controller');

const router = Router();

router.get('/', listAttachments);
router.delete('/:id', deleteAttachment);

module.exports = router;
