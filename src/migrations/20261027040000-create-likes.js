'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'likes',
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
          comment: '课程 ID',
          references: { model: 'courses', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        user_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          comment: '点赞用户 ID',
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
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
        comment: '课程点赞表'
      }
    );

    await queryInterface.addIndex('likes', ['course_id', 'user_id'], {
      name: 'likes_course_id_user_id_unique',
      unique: true
    });
    await queryInterface.addIndex('likes', ['user_id'], {
      name: 'idx_likes_user_id'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('likes');
  }
};
