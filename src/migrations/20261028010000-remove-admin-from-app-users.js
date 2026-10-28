'use strict';

/**
 * 清理 users 拆表时复制到 app_users 的管理员账号：
 * - 只处理与 sys_users 主键、邮箱、用户名都相同的记录（即拆表时保留 ID 复制过来的管理员）
 * - 管理员名下课程转交给最早创建的前台用户，保证课程不丢
 * - 管理员的点赞记录删除，并同步扣减课程点赞数
 * - 删除重复的前台管理员账号
 *
 * 全新数据库不会受影响：users 为空，拆表迁移不会产生重复管理员；
 * 种子数据也已改为管理员只写 sys_users、前台用户只写 app_users。
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;

    // 找出拆表时从 users 复制到 app_users 的管理员账号
    const [duplicates] = await sequelize.query(`
      SELECT a.id
      FROM \`app_users\` AS a
      INNER JOIN \`sys_users\` AS s
        ON s.id = a.id AND s.email = a.email AND s.username = a.username
      ORDER BY a.id ASC
    `);
    if (duplicates.length === 0) {
      return;
    }

    const adminIds = duplicates.map((item) => item.id);
    const placeholders = adminIds.map(() => '?').join(', ');

    // 选取接收课程的前台用户（优先最早创建的账号）
    const [replacements] = await sequelize.query(
      `SELECT id FROM \`app_users\` WHERE id NOT IN (${placeholders}) ORDER BY id ASC LIMIT 1`,
      { replacements: adminIds }
    );

    const [courseRows] = await sequelize.query(
      `SELECT COUNT(*) AS count FROM \`courses\` WHERE user_id IN (${placeholders})`,
      { replacements: adminIds }
    );
    const adminCourseCount = Number(courseRows[0].count);

    if (adminCourseCount > 0 && replacements.length === 0) {
      throw new Error('无法移除 app_users 中的管理员账号：没有可接收课程的前台用户');
    }

    if (replacements.length > 0) {
      await sequelize.query(
        `UPDATE \`courses\` SET user_id = ? WHERE user_id IN (${placeholders})`,
        { replacements: [replacements[0].id, ...adminIds] }
      );
    }

    // 删除管理员点赞，并扣减对应课程的点赞数
    await sequelize.query(
      `UPDATE \`courses\` AS c
       INNER JOIN (
         SELECT course_id, COUNT(*) AS cnt
         FROM \`likes\`
         WHERE user_id IN (${placeholders})
         GROUP BY course_id
       ) AS l ON l.course_id = c.id
       SET c.like_count = GREATEST(c.like_count - l.cnt, 0)`,
      { replacements: adminIds }
    );
    await sequelize.query(`DELETE FROM \`likes\` WHERE user_id IN (${placeholders})`, {
      replacements: adminIds
    });

    await sequelize.query(`DELETE FROM \`app_users\` WHERE id IN (${placeholders})`, {
      replacements: adminIds
    });
  },

  async down() {
    // 数据清理不可逆：管理员账号与课程归属无法还原，回滚时保留清理后的数据
  }
};
