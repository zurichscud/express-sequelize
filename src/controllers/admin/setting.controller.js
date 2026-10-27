const { success, fail } = require('../../utils/response');
const settingService = require('../../services/setting.service');

// 字段白名单
const EDITABLE_FIELDS = ['name', 'icp', 'copyright'];

// 只允许客户端提交可编辑字段，字段级校验统一交给模型
function pickSettingFields(body) {
  const source = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const payload = {};
  for (const field of EDITABLE_FIELDS) {
    if (source[field] !== undefined) {
      payload[field] = source[field];
    }
  }
  return payload;
}

/**
 * GET /api/admin/settings
 * 查询站点设置（表中仅一条记录，不存在时自动初始化默认记录）
 */
async function getSettings(req, res, next) {
  try {
    const setting = await settingService.getSettings();
    success(res, setting);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/settings
 * 更新站点设置（仅更新请求体中提供的字段）
 * 请求体：
 *   name      选填，站点名称，最长 100 字
 *   icp       选填，ICP 备案号，最长 64 字，传空字符串可清空
 *   copyright 选填，版权信息，最长 200 字，传空字符串可清空
 */
async function updateSettings(req, res, next) {
  try {
    const payload = pickSettingFields(req.body);
    if (!Object.keys(payload).length) {
      return fail(res, 400, '没有需要更新的字段');
    }

    const setting = await settingService.updateSettings(payload);
    success(res, setting);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSettings,
  updateSettings
};
