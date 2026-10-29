const path = require('node:path');

/**
 * 支持的媒体类型：MIME 与扩展名映射
 * 图片不包含 svg（可能携带脚本，存在 XSS 风险）
 */
const IMAGE_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/bmp': '.bmp',
  'image/avif': '.avif'
};

const VIDEO_TYPES = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'video/x-msvideo': '.avi',
  'video/x-matroska': '.mkv',
  'video/mpeg': '.mpeg'
};

// 部分客户端（如某些移动端、curl）可能传 application/octet-stream，此时按扩展名兜底识别
const EXTENSION_TYPES = Object.entries({
  ...IMAGE_TYPES,
  ...VIDEO_TYPES
}).reduce((acc, [mime, ext]) => {
  if (!acc[ext]) {
    acc[ext] = { mime, type: IMAGE_TYPES[mime] ? 'image' : 'video' };
  }
  return acc;
}, {});

// 常见扩展名别名
EXTENSION_TYPES['.jpeg'] = EXTENSION_TYPES['.jpg'];
EXTENSION_TYPES['.mpg'] = EXTENSION_TYPES['.mpeg'];
EXTENSION_TYPES['.mpe'] = EXTENSION_TYPES['.mpeg'];

/**
 * 解析并校验上传文件类型
 * @param {{ mimetype?: string, originalname?: string }} file
 * @returns {{ type: 'image'|'video', mime: string, ext: string } | null}
 */
function resolveMediaType(file) {
  const mime = String(file.mimetype || '').toLowerCase().split(';')[0].trim();

  if (IMAGE_TYPES[mime]) {
    return { type: 'image', mime, ext: IMAGE_TYPES[mime] };
  }
  if (VIDEO_TYPES[mime]) {
    return { type: 'video', mime, ext: VIDEO_TYPES[mime] };
  }

  // MIME 缺失或不规范时，按扩展名兜底
  if (!mime || mime === 'application/octet-stream') {
    const ext = path.extname(String(file.originalname || '')).toLowerCase();
    if (EXTENSION_TYPES[ext]) {
      return { type: EXTENSION_TYPES[ext].type, mime: EXTENSION_TYPES[ext].mime, ext };
    }
  }

  return null;
}

module.exports = {
  resolveMediaType
};
