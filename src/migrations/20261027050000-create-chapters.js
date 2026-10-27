'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'chapters',
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: '主键'
        },
        course_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          comment: '所属课程 ID',
          references: { model: 'courses', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        title: {
          type: Sequelize.STRING(200),
          allowNull: false,
          comment: '章节标题'
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: '章节内容'
        },
        video_url: {
          type: Sequelize.STRING(500),
          allowNull: true,
          comment: '视频地址'
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
        comment: '课程章节表'
      }
    );

    await queryInterface.addIndex('chapters', ['course_id', 'rank'], {
      name: 'idx_chapters_course_rank'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('chapters');
  }
};
