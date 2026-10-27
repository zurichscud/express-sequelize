const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define(
  'Course',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键'
    },
    category_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '分类 ID',
      validate: {
        notNull: { msg: '分类不能为空' },
        isValidId(value) {
          if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
            throw new Error('分类 ID 无效');
          }
        }
      }
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '所属用户 ID（创建者）',
      validate: {
        notNull: { msg: '用户不能为空' },
        isValidId(value) {
          if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
            throw new Error('用户 ID 无效');
          }
        }
      }
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
      comment: '课程名称',
      set(value) {
        this.setDataValue('name', typeof value === 'string' ? value.trim() : value);
      },
      validate: {
        notNull: { msg: '课程名称不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('课程名称格式不正确');
          }
        },
        notEmpty: { msg: '课程名称不能为空' },
        isValidLength(value) {
          if (value.length > 128) {
            throw new Error('课程名称长度不能超过 128 个字符');
          }
        }
      }
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '封面图片地址',
      set(value) {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          this.setDataValue('image', trimmed || null);
        } else {
          this.setDataValue('image', value);
        }
      },
      validate: {
        isString(value) {
          if (value != null && typeof value !== 'string') {
            throw new Error('封面图片格式不正确');
          }
        },
        isValidLength(value) {
          if (typeof value === 'string' && value.length > 500) {
            throw new Error('封面图片长度不能超过 500 个字符');
          }
        }
      }
    },
    is_recommended: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否推荐',
      // 兼容 'true'/'1'/'false'/'0' 等字符串入参
      set(value) {
        if (value === 'true' || value === 1 || value === '1') {
          value = true;
        } else if (value === 'false' || value === 0 || value === '0') {
          value = false;
        }
        this.setDataValue('is_recommended', value);
      },
      validate: {
        notNull: { msg: '是否推荐不能为空' },
        isBoolean(value) {
          if (typeof value !== 'boolean') {
            throw new Error('是否推荐格式不正确');
          }
        }
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '课程内容',
      validate: {
        isString(value) {
          if (value != null && typeof value !== 'string') {
            throw new Error('课程内容格式不正确');
          }
        }
      }
    },
    like_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '点赞数',
      validate: {
        notNull: { msg: '点赞数不能为空' },
        isValidCount(value) {
          if (value != null && (!Number.isInteger(Number(value)) || Number(value) < 0)) {
            throw new Error('点赞数必须是不小于 0 的整数');
          }
        }
      }
    },
    chapter_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '章节总数（由章节接口自动维护）',
      validate: {
        notNull: { msg: '章节总数不能为空' },
        isValidCount(value) {
          if (value != null && (!Number.isInteger(Number(value)) || Number(value) < 0)) {
            throw new Error('章节总数必须是不小于 0 的整数');
          }
        }
      }
    }
  },
  {
    tableName: 'courses',
    comment: '课程表'
  }
);

module.exports = Course;
