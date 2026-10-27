const { Setting } = require('../models');

/**
 * 查询站点设置（表中仅一条记录）
 * 记录不存在时自动初始化默认记录，保证 GET 接口始终有数据可返回
 * @returns {Promise<Setting>}
 */
async function getSettings() {
  const setting = await Setting.findOne({ order: [['id', 'ASC']] });
  if (setting) {
    return setting;
  }
  // 与默认种子数据保持一致，记录缺失时兜底初始化
  return Setting.create({
    name: '我的网站',
    icp: '粤ICP备12345678号',
    copyright: '© 2026 我的网站 版权所有'
  });
}

/**
 * 更新站点设置（仅一条记录，记录不存在时先初始化再更新）
 * @param {object} data
 * @returns {Promise<Setting>}
 */
async function updateSettings(data) {
  const setting = await getSettings();
  await setting.update(data);
  return setting;
}

module.exports = {
  getSettings,
  updateSettings
};
