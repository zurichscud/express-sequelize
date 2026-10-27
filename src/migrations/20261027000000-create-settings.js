'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'settings',
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: '主键'
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: '站点名称'
        },
        icp: {
          type: Sequelize.STRING(64),
          allowNull: true,
          comment: 'ICP 备案号'
        },
        copyright: {
          type: Sequelize.STRING(200),
          allowNull: true,
          comment: '版权信息'
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
        comment: '站点设置表（仅一条记录）'
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('settings');
  }
};
