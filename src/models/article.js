const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Article = sequelize.define(
  'Article',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '标题',
      set(value) {
        this.setDataValue('title', typeof value === 'string' ? value.trim() : value);
      },
      validate: {
        notNull: { msg: '标题不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('标题格式不正确');
          }
        },
        notEmpty: { msg: '标题不能为空' },
        isValidLength(value) {
          if (value.length > 200) {
            throw new Error('标题长度不能超过 200 个字符');
          }
        }
      }
    },
    summary: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '摘要',
      set(value) {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          this.setDataValue('summary', trimmed || null);
        } else {
          this.setDataValue('summary', value);
        }
      },
      validate: {
        isString(value) {
          if (value != null && typeof value !== 'string') {
            throw new Error('摘要格式不正确');
          }
        },
        isValidLength(value) {
          if (typeof value === 'string' && value.length > 500) {
            throw new Error('摘要长度不能超过 500 个字符');
          }
        }
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '正文',
      set(value) {
        this.setDataValue('content', typeof value === 'string' ? value.trim() : value);
      },
      validate: {
        notNull: { msg: '正文不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('正文格式不正确');
          }
        },
        notEmpty: { msg: '正文不能为空' }
      }
    },
    author: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: '匿名',
      comment: '作者',
      set(value) {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          this.setDataValue('author', trimmed || '匿名');
        } else {
          this.setDataValue('author', value);
        }
      },
      validate: {
        notNull: { msg: '作者不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('作者格式不正确');
          }
        },
        notEmpty: { msg: '作者不能为空' },
        isValidLength(value) {
          if (value.length > 64) {
            throw new Error('作者长度不能超过 64 个字符');
          }
        }
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'published'),
      allowNull: false,
      defaultValue: 'published',
      comment: '状态：draft 草稿 / published 已发布',
      set(value) {
        this.setDataValue('status', typeof value === 'string' ? value.trim() : value);
      },
      validate: {
        notNull: { msg: '状态不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('状态格式不正确');
          }
        },
        isIn: {
          args: [['draft', 'published']],
          msg: '状态只能是 draft 或 published'
        }
      }
    },
    views: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '浏览量'
    }
  },
  {
    tableName: 'articles',
    comment: '文章表',
    indexes: [
      { name: 'idx_articles_status_created', fields: ['status', 'created_at'] },
      { name: 'idx_articles_title', fields: ['title'] }
    ]
  }
);

module.exports = Article;
