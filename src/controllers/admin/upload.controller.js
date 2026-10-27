const { success, fail } = require('../../utils/response');
const uploadService = require('../../services/upload.service');

/**
 * POST /api/admin/uploads
 * 服务器代理上传单个图片或视频到阿里云 OSS
 * 请求类型：multipart/form-data
 * 表单字段：
 *   file  必填，图片或视频文件（字段名固定为 file）
 */
async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return fail(res, 400, '请选择要上传的文件');
    }

    const data = await uploadService.uploadFile(req.file, { userId: req.user && req.user.id });
    success(res, data, { status: 201, message: '上传成功' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadFile
};
