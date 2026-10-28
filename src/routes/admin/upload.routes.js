const { Router } = require('express');
const { presignUpload, completeUpload } = require('../../controllers/admin/upload.controller');

const router = Router();

// 客户端直传：先申请预签名地址，上传完成后再确认入库
router.post('/presign', presignUpload);
router.post('/complete', completeUpload);

module.exports = router;
