'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    // 已存在数据时跳过
    const rows = await queryInterface.sequelize.query('SELECT COUNT(*) AS count FROM `categories`', {
      type: queryInterface.sequelize.QueryTypes.SELECT
    });
    if (Number(rows[0].count) > 0) {
      return;
    }

    await queryInterface.bulkInsert('categories', [
      { name: '前端开发', rank: 1, created_at: new Date(), updated_at: new Date() },
      { name: '后端开发', rank: 2, created_at: new Date(), updated_at: new Date() },
      { name: '移动开发', rank: 3, created_at: new Date(), updated_at: new Date() },
      { name: '人工智能', rank: 4, created_at: new Date(), updated_at: new Date() }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
