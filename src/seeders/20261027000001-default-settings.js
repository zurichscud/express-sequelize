'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    // 表中仅保留一条设置记录，已存在时跳过
    const rows = await queryInterface.sequelize.query('SELECT COUNT(*) AS count FROM `settings`', {
      type: queryInterface.sequelize.QueryTypes.SELECT
    });
    if (Number(rows[0].count) > 0) {
      return;
    }

    await queryInterface.bulkInsert('settings', [
      {
        name: '我的网站',
        icp: '粤ICP备12345678号',
        copyright: '© 2026 我的网站 版权所有',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('settings', null, {});
  }
};
