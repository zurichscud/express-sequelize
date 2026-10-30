const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Like = sequelize.define(
  'Like',
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
      comment: '课程 ID',
      validate: {
        notNull: { msg: '课程不能为空' },
        isValidId(value) {
          if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
            throw new Error('课程 ID 无效');
          }
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '点赞前台用户 ID',
      validate: {
        notNull: { msg: '用户不能为空' },
        isValidId(value) {
          if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
            throw new Error('用户 ID 无效');
          }
        }
      }
    }
  },
  {
    tableName: 'likes',
    comment: '课程点赞表'
  }
);

module.exports = Like;
