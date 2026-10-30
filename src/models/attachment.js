const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TYPES = ['image', 'video'];

const Attachment = sequelize.define(
  'Attachment',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键'
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '上传系统用户 ID（用户删除后置空）',
      validate: {
        isValidId(value) {
          if (value != null && (!Number.isInteger(Number(value)) || Number(value) <= 0)) {
            throw new Error('上传用户 ID 无效');
          }
        }
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '原始文件名',
      set(value) {
        this.setDataValue('name', typeof value === 'string' ? value.trim() : value);
      },
      validate: {
        notNull: { msg: '文件名不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('文件名格式不正确');
          }
        },
        notEmpty: { msg: '文件名不能为空' },
        isValidLength(value) {
          if (value.length > 255) {
            throw new Error('文件名长度不能超过 255 个字符');
          }
        }
      }
    },
    objectKey: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
      comment: 'OSS 对象 Key',
      set(value) {
        this.setDataValue('objectKey', typeof value === 'string' ? value.trim() : value);
      },
      validate: {
        notNull: { msg: 'OSS 对象 Key 不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('OSS 对象 Key 格式不正确');
          }
        },
        notEmpty: { msg: 'OSS 对象 Key 不能为空' },
        isValidLength(value) {
          if (value.length > 500) {
            throw new Error('OSS 对象 Key 长度不能超过 500 个字符');
          }
        }
      }
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '公开访问地址',
      set(value) {
        this.setDataValue('url', typeof value === 'string' ? value.trim() : value);
      },
      validate: {
        notNull: { msg: '附件地址不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('附件地址格式不正确');
          }
        },
        notEmpty: { msg: '附件地址不能为空' },
        isValidLength(value) {
          if (value.length > 500) {
            throw new Error('附件地址长度不能超过 500 个字符');
          }
        }
      }
    },
    type: {
      type: DataTypes.ENUM('image', 'video'),
      allowNull: false,
      comment: '附件类型：image 图片 / video 视频',
      validate: {
        notNull: { msg: '附件类型不能为空' },
        isIn: {
          args: [TYPES],
          msg: '附件类型只能是 image 或 video'
        }
      }
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'MIME 类型',
      set(value) {
        this.setDataValue('mimeType', typeof value === 'string' ? value.trim() : value);
      },
      validate: {
        notNull: { msg: 'MIME 类型不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('MIME 类型格式不正确');
          }
        },
        notEmpty: { msg: 'MIME 类型不能为空' },
        isValidLength(value) {
          if (value.length > 100) {
            throw new Error('MIME 类型长度不能超过 100 个字符');
          }
        }
      }
    },
    size: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '文件大小（字节）',
      validate: {
        isValidSize(value) {
          if (!Number.isInteger(Number(value)) || Number(value) < 0) {
            throw new Error('文件大小无效');
          }
        }
      }
    }
  },
  {
    tableName: 'attachments',
    comment: '附件表（上传到 OSS 的文件）'
  }
);

module.exports = Attachment;
