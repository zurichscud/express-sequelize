const { Router } = require('express');
const { presignUpload, completeUpload } = require('../../controllers/admin/upload.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  presignUploadBodySchema,
  completeUploadBodySchema
} = require('../../validators/upload.validator');

const router = Router();

// 客户端直传：先申请预签名地址，上传完成后再确认入库
router.post('/presign', validate({ body: presignUploadBodySchema }), presignUpload);
router.post('/complete', validate({ body: completeUploadBodySchema }), completeUpload);

module.exports = router;
