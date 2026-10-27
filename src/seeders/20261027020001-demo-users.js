'use strict';

const { hashPassword } = require('../utils/password');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    // 已存在数据时跳过
    const rows = await queryInterface.sequelize.query('SELECT COUNT(*) AS count FROM `users`', {
      type: queryInterface.sequelize.QueryTypes.SELECT
    });
    if (Number(rows[0].count) > 0) {
      return;
    }

    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@example.com',
        password: hashPassword('123456'),
        username: 'admin',
        nickname: '管理员',
        sex: 'male',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'zhangsan@example.com',
        password: hashPassword('123456'),
        username: 'zhangsan',
        nickname: '张三',
        sex: 'male',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'lisi@example.com',
        password: hashPassword('123456'),
        username: 'lisi',
        nickname: '李四',
        sex: 'female',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
