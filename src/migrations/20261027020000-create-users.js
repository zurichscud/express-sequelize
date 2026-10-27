'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'users',
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: '主键'
        },
        email: {
          type: Sequelize.STRING(128),
          allowNull: false,
          unique: true,
          comment: '邮箱（唯一，登录凭证）'
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: '密码（bcrypt 哈希存储）'
        },
        username: {
          type: Sequelize.STRING(64),
          allowNull: false,
          unique: true,
          comment: '用户名（唯一）'
        },
        nickname: {
          type: Sequelize.STRING(64),
          allowNull: true,
          comment: '昵称'
        },
        sex: {
          type: Sequelize.ENUM('unknown', 'male', 'female'),
          allowNull: false,
          defaultValue: 'unknown',
          comment: '性别：unknown 未知 / male 男 / female 女'
        },
        role: {
          type: Sequelize.ENUM('user', 'admin'),
          allowNull: false,
          defaultValue: 'user',
          comment: '角色：user 普通用户 / admin 管理员'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        }
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        comment: '用户表'
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};
