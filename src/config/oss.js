const OSS = require('ali-oss');

// 必填配置，缺失时只在真正调用上传接口时报错，不影响其他接口和服务启动
const REQUIRED_KEYS = ['OSS_REGION', 'OSS_BUCKET', 'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET'];

let client = null;

/**
 * 解析正整数环境变量，非法值回退到默认值
 * @param {*} value
 * @param {number} fallback
 * @returns {number}
 */
function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * 读取并校验 OSS 配置
 * @returns {{ region: string, bucket: string, accessKeyId: string, accessKeySecret: string, endpoint?: string }}
 */
function getOssConfig() {
  const missing = REQUIRED_KEYS.filter((key) => !String(process.env[key] || '').trim());
  if (missing.length) {
    const err = new Error(`OSS 配置缺失：请先在 .env 中配置 ${missing.join('、')}`);
    err.status = 503;
    throw err;
  }

  const endpoint = String(process.env.OSS_ENDPOINT || '').trim();

  return {
    region: String(process.env.OSS_REGION).trim(),
    bucket: String(process.env.OSS_BUCKET).trim(),
    accessKeyId: String(process.env.OSS_ACCESS_KEY_ID).trim(),
    accessKeySecret: String(process.env.OSS_ACCESS_KEY_SECRET).trim(),
    // 不填则由 ali-oss 根据 region 自动拼出 oss-<region>.aliyuncs.com
    ...(endpoint ? { endpoint } : {})
  };
}

/**
 * 获取 OSS 客户端单例
 * @returns {import('ali-oss')}
 */
function getOssClient() {
  if (!client) {
    const timeout = Number(process.env.OSS_TIMEOUT);
    client = new OSS({
      ...getOssConfig(),
      secure: true,
      // 服务端只做签名、校验和删除，默认超时设为 10 分钟
      timeout: Number.isFinite(timeout) && timeout > 0 ? timeout : 600000
    });
  }
  return client;
}

/**
 * 上传大小限制（MB），可通过环境变量覆盖
 * @returns {{ image: number, video: number }}
 */
function getUploadSizeLimits() {
  return {
    image: toPositiveInt(process.env.OSS_IMAGE_MAX_SIZE_MB, 10),
    video: toPositiveInt(process.env.OSS_VIDEO_MAX_SIZE_MB, 500)
  };
}

/**
 * 生成对象的公开访问地址
 * 配置了 OSS_PUBLIC_URL（如 CDN 域名）时优先使用，否则使用 bucket 默认域名
 * @param {string} objectKey
 * @returns {string}
 */
function getObjectUrl(objectKey) {
  const baseUrl = String(process.env.OSS_PUBLIC_URL || '').trim();
  return getOssClient().generateObjectUrl(objectKey, baseUrl || undefined);
}

module.exports = {
  getOssClient,
  getObjectUrl,
  getUploadSizeLimits
};
