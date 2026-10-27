const { success } = require('../../utils/response');
const settingService = require('../../services/setting.service');

/**
 * GET /api/settings
 * 前台站点设置（站点名称、备案号、版权信息）
 */
async function getSettings(req, res, next) {
  try {
    const setting = await settingService.getSettings();
    success(res, setting);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSettings
};
