const { DataTypes } = require('sequelize');
const { hashPassword } = require('../utils/password');

const SEXES = ['unknown', 'male', 'female'];
const ROLES = ['user', 'admin'];

/**
 * 构造系统用户 / 前台用户共用的字段定义
 * sys_users 额外保留 role，app_users 不包含角色字段
 * @param {{ withRole?: boolean }} [options]
 * @returns {object}
 */
function buildUserAttributes({ withRole = false } = {}) {
  const attributes = {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键'
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
      comment: '邮箱（唯一，登录凭证）',
      set(value) {
        this.setDataValue('email', typeof value === 'string' ? value.trim().toLowerCase() : value);
      },
      validate: {
        notNull: { msg: '邮箱不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('邮箱格式不正确');
          }
        },
        notEmpty: { msg: '邮箱不能为空' },
        isValidLength(value) {
          if (value.length > 128) {
            throw new Error('邮箱长度不能超过 128 个字符');
          }
        },
        isEmail: { msg: '邮箱格式不正确' }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码（bcrypt 哈希存储）',
      // 注意：明文格式校验放在服务层。
      // update 时钩子哈希后 Sequelize 会对新值二次校验，模型层的长度校验会误判哈希值
      validate: {
        notNull: { msg: '密码不能为空' }
      }
    },
    username: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      comment: '用户名（唯一）',
      set(value) {
        this.setDataValue('username', typeof value === 'string' ? value.trim() : value);
      },
      validate: {
        notNull: { msg: '用户名不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('用户名格式不正确');
          }
        },
        notEmpty: { msg: '用户名不能为空' },
        isValidLength(value) {
          if (value.length > 64) {
            throw new Error('用户名长度不能超过 64 个字符');
          }
        },
        isValidFormat(value) {
          if (!/^[A-Za-z0-9_-]+$/.test(value)) {
            throw new Error('用户名只能包含字母、数字、下划线和短横线');
          }
        }
      }
    },
    nickname: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: '昵称',
      set(value) {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          this.setDataValue('nickname', trimmed || null);
        } else {
          this.setDataValue('nickname', value);
        }
      },
      validate: {
        isString(value) {
          if (value != null && typeof value !== 'string') {
            throw new Error('昵称格式不正确');
          }
        },
        isValidLength(value) {
          if (typeof value === 'string' && value.length > 64) {
            throw new Error('昵称长度不能超过 64 个字符');
          }
        }
      }
    },
    sex: {
      type: DataTypes.ENUM('unknown', 'male', 'female'),
      allowNull: false,
      defaultValue: 'unknown',
      comment: '性别：unknown 未知 / male 男 / female 女',
      set(value) {
        this.setDataValue('sex', typeof value === 'string' ? value.trim() : value);
      },
      validate: {
        notNull: { msg: '性别不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('性别格式不正确');
          }
        },
        isIn: {
          args: [SEXES],
          msg: '性别只能是 unknown、male 或 female'
        }
      }
    }
  };

  if (withRole) {
    attributes.role = {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
      comment: '角色：user 普通用户 / admin 管理员',
      set(value) {
        this.setDataValue('role', typeof value === 'string' ? value.trim() : value);
      },
      validate: {
        notNull: { msg: '角色不能为空' },
        isString(value) {
          if (typeof value !== 'string') {
            throw new Error('角色格式不正确');
          }
        },
        isIn: {
          args: [ROLES],
          msg: '角色只能是 user 或 admin'
        }
      }
    };
  }

  return attributes;
}

const userHooks = {
  // 入库前把明文哈希（bcrypt，明文长度校验在服务层完成）
  beforeCreate(instance) {
    instance.password = hashPassword(instance.password);
  },
  beforeUpdate(instance) {
    if (instance.changed('password')) {
      instance.password = hashPassword(instance.password);
    }
  }
};

module.exports = {
  SEXES,
  ROLES,
  buildUserAttributes,
  userHooks
};
