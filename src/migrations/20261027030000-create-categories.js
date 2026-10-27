'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'categories',
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: '主键'
        },
        name: {
          type: Sequelize.STRING(64),
          allowNull: false,
          unique: true,
          comment: '分类名称（唯一）'
        },
        rank: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: '排序序号，越小越靠前'
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
        comment: '分类表'
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('categories');
  }
};
