'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'articles',
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: '主键'
        },
        title: {
          type: Sequelize.STRING(200),
          allowNull: false,
          comment: '标题'
        },
        summary: {
          type: Sequelize.STRING(500),
          allowNull: true,
          comment: '摘要'
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
          comment: '正文'
        },
        author: {
          type: Sequelize.STRING(64),
          allowNull: false,
          defaultValue: '匿名',
          comment: '作者'
        },
        status: {
          type: Sequelize.ENUM('draft', 'published'),
          allowNull: false,
          defaultValue: 'published',
          comment: '状态：draft 草稿 / published 已发布'
        },
        views: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
          comment: '浏览量'
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
        comment: '文章表'
      }
    );

    await queryInterface.addIndex('articles', ['status', 'created_at'], {
      name: 'idx_articles_status_created'
    });
    await queryInterface.addIndex('articles', ['title'], {
      name: 'idx_articles_title'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('articles');
  }
};
