'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'courses',
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: '主键'
        },
        category_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          comment: '分类 ID',
          references: { model: 'categories', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        user_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          comment: '所属用户 ID（创建者）',
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        name: {
          type: Sequelize.STRING(128),
          allowNull: false,
          comment: '课程名称'
        },
        image: {
          type: Sequelize.STRING(500),
          allowNull: true,
          comment: '封面图片地址'
        },
        is_recommended: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: '是否推荐'
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: '课程内容'
        },
        like_count: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
          comment: '点赞数'
        },
        chapter_count: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
          comment: '章节总数'
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
        comment: '课程表'
      }
    );

    await queryInterface.addIndex('courses', ['category_id'], {
      name: 'idx_courses_category_id'
    });
    await queryInterface.addIndex('courses', ['user_id'], {
      name: 'idx_courses_user_id'
    });
    await queryInterface.addIndex('courses', ['is_recommended', 'created_at'], {
      name: 'idx_courses_recommended_created'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('courses');
  }
};
