const { success, fail } = require('../../utils/response');
const uploadService = require('../../services/upload.service');

/**
 * POST /api/admin/uploads/presign
 * 申请 OSS 直传预签名地址，客户端拿到后用 PUT 直接把文件传到 OSS
 * 请求体：
 *   name  必填，原始文件名（用于识别扩展名）
 *   mime  必填，文件 MIME 类型
 *   size  必填，文件大小（字节），服务端按类型校验上限
 */
function presignUpload(req, res, next) {
  try {
    const { name, mime, size } = req.body || {};
    const data = uploadService.createPresignedUpload(
      { name, mime, size },
      { userId: req.user && req.user.id }
    );
    success(res, data);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/uploads/complete
 * 客户端直传完成后调用，服务端校验 OSS 对象并写入附件表
 * 请求体：
 *   upload_token  必填，预签名接口返回的直传凭证
 */
async function completeUpload(req, res, next) {
  try {
    const uploadToken = String((req.body && req.body.upload_token) || '').trim();
    if (!uploadToken) {
      return fail(res, 400, '缺少上传凭证');
    }

    const data = await uploadService.completeUpload(uploadToken, {
      userId: req.user && req.user.id
    });
    success(res, data, { status: 201, message: '上传成功' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  presignUpload,
  completeUpload
};
