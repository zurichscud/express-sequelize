'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // 把历史课程数据里手填的 chapter_count 对齐到 chapters 实际数量
    await queryInterface.sequelize.query(`
      UPDATE \`courses\` AS c
      LEFT JOIN (
        SELECT \`course_id\`, COUNT(*) AS \`total\`
        FROM \`chapters\`
        GROUP BY \`course_id\`
      ) AS ch ON ch.\`course_id\` = c.\`id\`
      SET c.\`chapter_count\` = COALESCE(ch.\`total\`, 0)
    `);
  },

  async down() {
    // 数据回填不可逆，无需回滚
  }
};
