'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'attachments',
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: '主键'
        },
        user_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
          comment: '上传用户 ID（用户删除后置空）',
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: '原始文件名'
        },
        object_key: {
          type: Sequelize.STRING(500),
          allowNull: false,
          unique: true,
          comment: 'OSS 对象 Key'
        },
        url: {
          type: Sequelize.STRING(500),
          allowNull: false,
          comment: '公开访问地址'
        },
        type: {
          type: Sequelize.ENUM('image', 'video'),
          allowNull: false,
          comment: '附件类型：image 图片 / video 视频'
        },
        mime_type: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'MIME 类型'
        },
        size: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
          comment: '文件大小（字节）'
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
        comment: '附件表（上传到 OSS 的文件）'
      }
    );

    await queryInterface.addIndex('attachments', ['user_id'], {
      name: 'idx_attachments_user_id'
    });
    await queryInterface.addIndex('attachments', ['type', 'created_at'], {
      name: 'idx_attachments_type_created'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('attachments');
  }
};
