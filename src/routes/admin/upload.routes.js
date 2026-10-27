const { Router } = require('express');
const { uploadFile } = require('../../controllers/admin/upload.controller');
const { uploadSingleFile } = require('../../middlewares/upload.middleware');

const router = Router();

// 表单字段名固定为 file，服务器接收后代理上传到 OSS
router.post('/', uploadSingleFile, uploadFile);

module.exports = router;
