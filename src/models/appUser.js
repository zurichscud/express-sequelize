const sequelize = require('../config/database');
const { buildUserAttributes, userHooks } = require('./userBase');

const AppUser = sequelize.define('AppUser', buildUserAttributes(), {
  tableName: 'app_users',
  comment: '前台用户表（Web 注册账号）',
  hooks: userHooks
});

module.exports = AppUser;
