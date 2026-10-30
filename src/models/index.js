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
Category.hasMany(Course, { foreignKey: 'categoryId', as: 'courses' });
Course.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// 课程与点赞归属前台用户（app_users）
AppUser.hasMany(Course, { foreignKey: 'userId', as: 'courses' });
Course.belongsTo(AppUser, { foreignKey: 'userId', as: 'user' });

// 点赞关系
Course.hasMany(Like, { foreignKey: 'courseId', as: 'likes' });
Like.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
AppUser.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Like.belongsTo(AppUser, { foreignKey: 'userId', as: 'user' });

// 课程章节
Course.hasMany(Chapter, { foreignKey: 'courseId', as: 'chapters' });
Chapter.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// 附件由后台上传，归属系统用户（系统用户删除后 userId 置空，附件记录保留）
SysUser.hasMany(Attachment, { foreignKey: 'userId', as: 'attachments' });
Attachment.belongsTo(SysUser, { foreignKey: 'userId', as: 'user' });

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
