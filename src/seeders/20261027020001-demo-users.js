'use strict';

const { hashPassword } = require('../utils/password');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    // 已存在数据时跳过
    const rows = await queryInterface.sequelize.query(
      'SELECT (SELECT COUNT(*) FROM `sys_users`) AS sys_count, (SELECT COUNT(*) FROM `app_users`) AS app_count',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    if (Number(rows[0].sys_count) > 0 || Number(rows[0].app_count) > 0) {
      return;
    }

    const now = new Date();
    const demoPassword = () => hashPassword('123456');

    // 后台登录账号
    await queryInterface.bulkInsert('sys_users', [
      {
        id: 1,
        email: 'admin@example.com',
        password: demoPassword(),
        username: 'admin',
        nickname: '管理员',
        sex: 'male',
        role: 'admin',
        created_at: now,
        updated_at: now
      }
    ]);

    // 前台注册用户；保留固定 ID，与 demo-courses 中的 user_id 对应
    await queryInterface.bulkInsert('app_users', [
      {
        id: 1,
        email: 'zhangsan@example.com',
        password: demoPassword(),
        username: 'zhangsan',
        nickname: '张三',
        sex: 'male',
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        email: 'lisi@example.com',
        password: demoPassword(),
        username: 'lisi',
        nickname: '李四',
        sex: 'female',
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('app_users', null, {});
    await queryInterface.bulkDelete('sys_users', null, {});
  }
};
