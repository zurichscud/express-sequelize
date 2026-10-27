const fs = require('node:fs/promises');
const { randomUUID } = require('node:crypto');
const { getOssClient, getObjectUrl } = require('../config/oss');
const { getUploadSizeLimits, resolveMediaType } = require('../config/upload');
const { Attachment } = require('../models');

const MB = 1024 * 1024;

/**
 * 规范原始文件名，避免超长文件名导致附件记录写入失败
 * @param {*} name
 * @returns {string}
 */
function normalizeFileName(name) {
  const trimmed = String(name || '').trim();
  return (trimmed || '未命名文件').slice(0, 255);
}

/**
 * 从 OSS 删除对象，失败时统一转成 502
 * @param {string} objectKey
 */
async function removeObject(objectKey) {
  const client = getOssClient();
  try {
    await client.delete(objectKey);
  } catch (err) {
    const wrapped = new Error(`删除 OSS 文件失败：${err.message}`);
    wrapped.status = 502;
    throw wrapped;
  }
}

/**
 * 生成对象 Key，按 类型/年/月 分目录，文件名使用 UUID 避免重名和中文名兼容问题
 * @param {{ type: 'image'|'video', ext: string }} media
 * @returns {string}
 */
function buildObjectKey(media) {
  const prefix = String(process.env.OSS_DIR || 'uploads')
    .trim()
    .replace(/^\/+|\/+$/g, '') || 'uploads';
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${prefix}/${media.type}/${year}/${month}/${randomUUID()}${media.ext}`;
}

/**
 * 上传单个文件到 OSS 并写入附件表，上传结束后删除本地临时文件
 * @param {Express.Multer.File} file
 * @param {{ userId?: number|string|null }} [options]
 * @returns {Promise<object>}
 */
async function uploadFile(file, { userId = null } = {}) {
  try {
    const media = resolveMediaType(file);
    if (!media) {
      const err = new Error('仅支持上传图片或视频文件');
      err.status = 400;
      throw err;
    }

    const limits = getUploadSizeLimits();
    const limitMB = limits[media.type];
    if (Number(file.size || 0) > limitMB * MB) {
      const err = new Error(`${media.type === 'image' ? '图片' : '视频'}不能超过 ${limitMB}MB`);
      err.status = 413;
      throw err;
    }

    const objectKey = buildObjectKey(media);
    // 先取客户端，配置缺失时直接抛出 503，不当作上传失败
    const client = getOssClient();

    try {
      await client.put(objectKey, file.path, {
        mime: media.mime,
        headers: {
          // 对象 Key 带 UUID，内容不会变化，可长期缓存
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
    } catch (err) {
      const wrapped = new Error(`上传到 OSS 失败：${err.message}`);
      wrapped.status = 502;
      throw wrapped;
    }

    let url;
    try {
      url = getObjectUrl(objectKey);
    } catch (err) {
      // 地址生成失败时回滚已上传对象，避免产生无记录的孤儿文件
      await removeObject(objectKey).catch(() => {});
      throw err;
    }

    try {
      return await Attachment.create({
        user_id: userId || null,
        name: normalizeFileName(file.originalname),
        object_key: objectKey,
        url,
        type: media.type,
        mime_type: media.mime,
        size: Number(file.size || 0)
      });
    } catch (err) {
      // 附件记录写入失败时回滚 OSS 文件，保证“上传即入库”
      await removeObject(objectKey).catch(() => {});
      const wrapped = new Error('附件记录保存失败');
      wrapped.status = 500;
      wrapped.cause = err;
      throw wrapped;
    }
  } finally {
    // 无论成功失败都清理临时文件，避免占满磁盘
    if (file.path) {
      await fs.unlink(file.path).catch(() => {});
    }
  }
}

module.exports = {
  uploadFile,
  removeObject
};
