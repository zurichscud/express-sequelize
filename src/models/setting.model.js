const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define(
  'Setting',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '站点名称',
      set(value) {
        this.setDataValue('name', typeof value === 'string' ? value.trim() : value);
      },
      validate: {
        notNull: { msg: '站点名称不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('站点名称格式不正确');
          }
        },
        notEmpty: { msg: '站点名称不能为空' },
        isValidLength(value) {
          if (value.length > 100) {
            throw new Error('站点名称长度不能超过 100 个字符');
          }
        }
      }
    },
    icp: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: 'ICP 备案号',
      set(value) {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          this.setDataValue('icp', trimmed || null);
        } else {
          this.setDataValue('icp', value);
        }
      },
      validate: {
        isString(value) {
          if (value != null && typeof value !== 'string') {
            throw new Error('ICP 备案号格式不正确');
          }
        },
        isValidLength(value) {
          if (typeof value === 'string' && value.length > 64) {
            throw new Error('ICP 备案号长度不能超过 64 个字符');
          }
        }
      }
    },
    copyright: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '版权信息',
      set(value) {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          this.setDataValue('copyright', trimmed || null);
        } else {
          this.setDataValue('copyright', value);
        }
      },
      validate: {
        isString(value) {
          if (value != null && typeof value !== 'string') {
            throw new Error('版权信息格式不正确');
          }
        },
        isValidLength(value) {
          if (typeof value === 'string' && value.length > 200) {
            throw new Error('版权信息长度不能超过 200 个字符');
          }
        }
      }
    }
  },
  {
    tableName: 'settings',
    comment: '站点设置表（仅一条记录）'
  }
);

module.exports = Setting;
