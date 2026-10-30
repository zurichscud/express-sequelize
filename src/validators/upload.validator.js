const { z } = require('zod');
const { bodyObject, requiredString, optionalString } = require('./common');

const presignUploadBodySchema = bodyObject({
  name: requiredString('文件名', 255),
  // 部分浏览器拿不到 MIME（如 mkv），留空时由服务层按扩展名兜底识别
  mime: optionalString('文件类型', 128),
  size: z.coerce
    .number({ error: '文件大小无效' })
    .int('文件大小无效')
    .positive('文件大小无效')
});

const completeUploadBodySchema = bodyObject({
  uploadToken: z.preprocess(
    (value) => (value === undefined || value === null ? '' : value),
    z.string({ error: '缺少上传凭证' }).trim().min(1, '缺少上传凭证')
  )
});

module.exports = {
  presignUploadBodySchema,
  completeUploadBodySchema
};
