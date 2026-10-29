const { success } = require('../../utils/response');
const settingService = require('../../services/setting.service');

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
 * 更新站点设置（请求体字段与格式由 setting.validator.js 校验）
 *   name      选填，站点名称，最长 100 字
 *   icp       选填，ICP 备案号，最长 64 字，传空字符串可清空
 *   copyright 选填，版权信息，最长 200 字，传空字符串可清空
 */
async function updateSettings(req, res, next) {
  try {
    const setting = await settingService.updateSettings(req.validated.body);
    success(res, setting);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSettings,
  updateSettings
};
