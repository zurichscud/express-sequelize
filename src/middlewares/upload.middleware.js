const os = require('node:os');
const { randomUUID } = require('node:crypto');
const multer = require('multer');
const { getUploadSizeLimits, resolveMediaType } = require('../config/upload');

const MB = 1024 * 1024;

// 使用系统临时目录接收文件，再流式上传到 OSS，避免大视频占用进程内存
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => cb(null, `oss-upload-${Date.now()}-${randomUUID()}`)
});

const { image: imageLimitMB, video: videoLimitMB } = getUploadSizeLimits();

const mediaUpload = multer({
  storage,
  limits: {
    // 先按图片、视频中较大的上限接收，具体类型的大小在 Service 层再次校验
    fileSize: Math.max(imageLimitMB, videoLimitMB) * MB,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (!resolveMediaType(file)) {
      const err = new Error('仅支持上传图片（jpg/jpeg/png/gif/webp/bmp/avif）或视频（mp4/webm/mov/avi/mkv/mpeg）文件');
      err.status = 400;
      return cb(err);
    }
    return cb(null, true);
  }
});

/**
 * 接收单个文件（表单字段名固定为 file），并把 multer 错误转换成统一的中文提示
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function uploadSingleFile(req, res, next) {
  mediaUpload.single('file')(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
      err.status = 413;
      err.message = `文件过大：图片最大 ${imageLimitMB}MB，视频最大 ${videoLimitMB}MB`;
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
      err.status = 400;
      err.message = '文件字段名必须为 file，且一次只能上传一个文件';
    } else if (err instanceof multer.MulterError) {
      err.status = 400;
      err.message = `文件上传失败：${err.message}`;
    }

    return next(err);
  });
}

module.exports = {
  uploadSingleFile
};
