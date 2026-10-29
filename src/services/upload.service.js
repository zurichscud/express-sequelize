const { randomUUID } = require('node:crypto');
const { getOssClient, getObjectUrl, getUploadSizeLimits } = require('../config/oss');
const { resolveMediaType } = require('../utils/media');
const { signToken, verifyToken } = require('../utils/jwt');
const { Attachment } = require('../models');

const MB = 1024 * 1024;

// 预签名直传地址默认 1 小时有效，大视频在慢网络下也能传完
const DEFAULT_PRESIGN_EXPIRES = 3600;
// 直传凭证的 JWT purpose，避免与登录 token 混用
const UPLOAD_TOKEN_SCOPE = 'oss-upload';

/**
 * 读取预签名地址有效期（秒），可通过 OSS_PRESIGN_EXPIRES 覆盖
 * @returns {number}
 */
function getPresignExpires() {
  const parsed = Number.parseInt(process.env.OSS_PRESIGN_EXPIRES, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_PRESIGN_EXPIRES;
}

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
 * 为客户端直传签发 OSS 预签名地址
 * 服务端只负责校验类型、大小并签名，文件内容不经过 Express
 * @param {{ name?: string, mime?: string, size?: number|string }} payload
 * @param {{ userId?: number|string|null }} [options]
 * @returns {{ object_key: string, name: string, type: 'image'|'video', mime_type: string,
 *   size: number, upload_url: string, method: 'PUT', headers: Record<string, string>,
 *   expires_at: string, upload_token: string }}
 */
function createPresignedUpload({ name, mime, size }, { userId = null } = {}) {
  const fileName = normalizeFileName(name);
  const media = resolveMediaType({ mimetype: mime, originalname: fileName });
  if (!media) {
    const err = new Error('仅支持上传图片或视频文件');
    err.status = 400;
    throw err;
  }

  const fileSize = Number(size);
  if (!Number.isInteger(fileSize) || fileSize <= 0) {
    const err = new Error('文件大小无效');
    err.status = 400;
    throw err;
  }

  const limits = getUploadSizeLimits();
  const limitMB = limits[media.type];
  if (fileSize > limitMB * MB) {
    const err = new Error(`${media.type === 'image' ? '图片' : '视频'}不能超过 ${limitMB}MB`);
    err.status = 413;
    throw err;
  }

  const objectKey = buildObjectKey(media);
  const expires = getPresignExpires();

  // Content-Type 参与签名，客户端上传时必须携带完全一致的请求头
  const uploadUrl = getOssClient().signatureUrl(objectKey, {
    method: 'PUT',
    expires,
    'Content-Type': media.mime
  });

  // 凭证比上传地址多 10 分钟有效，避免临近过期才传完的文件无法确认
  const { token } = signToken(
    {
      scope: UPLOAD_TOKEN_SCOPE,
      objectKey,
      name: fileName,
      type: media.type,
      mimeType: media.mime,
      size: fileSize,
      userId: userId || null
    },
    { expiresIn: expires + 600 }
  );

  return {
    object_key: objectKey,
    name: fileName,
    type: media.type,
    mime_type: media.mime,
    size: fileSize,
    upload_url: uploadUrl,
    method: 'PUT',
    headers: {
      'Content-Type': media.mime
    },
    expires_at: new Date(Date.now() + expires * 1000).toISOString(),
    upload_token: token
  };
}

/**
 * 客户端直传完成后确认上传：校验临时凭证与 OSS 对象，再写入附件表
 * @param {string} uploadToken 预签名接口返回的 upload_token
 * @param {{ userId?: number|string|null }} [options]
 * @returns {Promise<object>}
 */
async function completeUpload(uploadToken, { userId = null } = {}) {
  let payload;
  try {
    payload = verifyToken(uploadToken);
  } catch (err) {
    const wrapped = new Error('上传凭证无效或已过期，请重新上传');
    wrapped.status = 400;
    throw wrapped;
  }

  if (
    payload.scope !== UPLOAD_TOKEN_SCOPE ||
    !payload.objectKey ||
    !payload.name ||
    !payload.mimeType ||
    !['image', 'video'].includes(payload.type)
  ) {
    const err = new Error('上传凭证无效，请重新上传');
    err.status = 400;
    throw err;
  }

  if (payload.userId != null && String(payload.userId) !== String(userId || '')) {
    const err = new Error('上传凭证与当前登录用户不匹配');
    err.status = 403;
    throw err;
  }

  // 重复确认时直接返回已有记录，保证接口幂等
  const existing = await Attachment.findOne({ where: { object_key: payload.objectKey } });
  if (existing) {
    return existing;
  }

  const client = getOssClient();

  let head;
  try {
    head = await client.head(payload.objectKey);
  } catch (err) {
    if (err.status === 404 || err.code === 'NoSuchKey') {
      const notFound = new Error('文件尚未上传完成，请重新上传');
      notFound.status = 400;
      throw notFound;
    }
    const wrapped = new Error(`校验 OSS 文件失败：${err.message}`);
    wrapped.status = 502;
    throw wrapped;
  }

  const actualSize = Number(head.res.headers['content-length']);
  const limits = getUploadSizeLimits();
  const limitMB = limits[payload.type];

  if (!Number.isInteger(actualSize) || actualSize <= 0 || actualSize > limitMB * MB) {
    // 实际文件不合法时删除对象，避免留下无法入库的孤儿文件
    await removeObject(payload.objectKey).catch(() => {});
    const err = new Error(
      actualSize > limitMB * MB
        ? `${payload.type === 'image' ? '图片' : '视频'}不能超过 ${limitMB}MB`
        : '上传的文件内容无效，请重新上传'
    );
    err.status = actualSize > limitMB * MB ? 413 : 400;
    throw err;
  }

  const url = getObjectUrl(payload.objectKey);

  try {
    return await Attachment.create({
      user_id: payload.userId || null,
      name: payload.name,
      object_key: payload.objectKey,
      url,
      type: payload.type,
      mime_type: payload.mimeType,
      size: actualSize
    });
  } catch (err) {
    // 并发确认时唯一键冲突，返回已写入的记录
    if (err.name === 'SequelizeUniqueConstraintError') {
      const record = await Attachment.findOne({ where: { object_key: payload.objectKey } });
      if (record) {
        return record;
      }
    }

    await removeObject(payload.objectKey).catch(() => {});
    const wrapped = new Error('附件记录保存失败');
    wrapped.status = 500;
    wrapped.cause = err;
    throw wrapped;
  }
}

module.exports = {
  createPresignedUpload,
  completeUpload,
  removeObject
};
