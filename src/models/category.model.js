const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键'
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      comment: '分类名称（唯一）',
      set(value) {
        this.setDataValue('name', typeof value === 'string' ? value.trim() : value);
      },
      validate: {
        notNull: { msg: '分类名称不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('分类名称格式不正确');
          }
        },
        notEmpty: { msg: '分类名称不能为空' },
        isValidLength(value) {
          if (value.length > 64) {
            throw new Error('分类名称长度不能超过 64 个字符');
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
          if (value != null && (Number.isNaN(Number(value)) || !Number.isInteger(Number(value)))) {
            throw new Error('排序序号必须是整数');
          }
        }
      }
    }
  },
  {
    tableName: 'categories',
    comment: '分类表'
  }
);

module.exports = Category;
