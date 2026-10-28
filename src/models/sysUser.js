const sequelize = require('../config/database');
const { buildUserAttributes, userHooks } = require('./userBase');

const SysUser = sequelize.define('SysUser', buildUserAttributes({ withRole: true }), {
  tableName: 'sys_users',
  comment: '系统用户表（后台登录账号）',
  hooks: userHooks
});

module.exports = SysUser;
