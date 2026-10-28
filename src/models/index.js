const sequelize = require('../config/database');
const Article = require('./article');
const Setting = require('./setting');
const SysUser = require('./sysUser');
const AppUser = require('./appUser');
const Category = require('./category');
const Course = require('./course');
const Like = require('./like');
const Chapter = require('./chapter');
const Attachment = require('./attachment');

// 分类与课程
Category.hasMany(Course, { foreignKey: 'category_id', as: 'courses' });
Course.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// 课程与点赞归属前台用户（app_users）
AppUser.hasMany(Course, { foreignKey: 'user_id', as: 'courses' });
Course.belongsTo(AppUser, { foreignKey: 'user_id', as: 'user' });

// 点赞关系
Course.hasMany(Like, { foreignKey: 'course_id', as: 'likes' });
Like.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
AppUser.hasMany(Like, { foreignKey: 'user_id', as: 'likes' });
Like.belongsTo(AppUser, { foreignKey: 'user_id', as: 'user' });

// 课程章节
Course.hasMany(Chapter, { foreignKey: 'course_id', as: 'chapters' });
Chapter.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// 附件由后台上传，归属系统用户（系统用户删除后 user_id 置空，附件记录保留）
SysUser.hasMany(Attachment, { foreignKey: 'user_id', as: 'attachments' });
Attachment.belongsTo(SysUser, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  Article,
  Setting,
  SysUser,
  AppUser,
  Category,
  Course,
  Like,
  Chapter,
  Attachment
};
