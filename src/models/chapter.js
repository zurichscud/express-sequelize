const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chapter = sequelize.define(
  'Chapter',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键'
    },
    courseId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '所属课程 ID',
      validate: {
        notNull: { msg: '课程不能为空' },
        isValidId(value) {
          if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
            throw new Error('课程 ID 无效');
          }
        }
      }
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '章节标题',
      set(value) {
        this.setDataValue('title', typeof value === 'string' ? value.trim() : value);
      },
      validate: {
        notNull: { msg: '章节标题不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('章节标题格式不正确');
          }
        },
        notEmpty: { msg: '章节标题不能为空' },
        isValidLength(value) {
          if (value.length > 200) {
            throw new Error('章节标题长度不能超过 200 个字符');
          }
        }
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '章节内容',
      validate: {
        isString(value) {
          if (value != null && typeof value !== 'string') {
            throw new Error('章节内容格式不正确');
          }
        }
      }
    },
    videoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '视频地址',
      set(value) {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          this.setDataValue('videoUrl', trimmed || null);
        } else {
          this.setDataValue('videoUrl', value);
        }
      },
      validate: {
        isString(value) {
          if (value != null && typeof value !== 'string') {
            throw new Error('视频地址格式不正确');
          }
        },
        isValidLength(value) {
          if (typeof value === 'string' && value.length > 500) {
            throw new Error('视频地址长度不能超过 500 个字符');
          }
        }
      }
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序序号，越小越靠前',
      validate: {
        notNull: { msg: '排序序号不能为空' },
        isValidRank(value) {
          if (value != null && !Number.isInteger(Number(value))) {
            throw new Error('排序序号必须是整数');
          }
        }
      }
    }
  },
  {
    tableName: 'chapters',
    comment: '课程章节表'
  }
);

module.exports = Chapter;
