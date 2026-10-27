const sequelize = require('../config/database');
const Article = require('./article');
const Setting = require('./setting');
const User = require('./user');
const Category = require('./category');
const Course = require('./course');
const Like = require('./like');
const Chapter = require('./chapter');
const Attachment = require('./attachment');

// 关联关系
Category.hasMany(Course, { foreignKey: 'category_id', as: 'courses' });
Course.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
User.hasMany(Course, { foreignKey: 'user_id', as: 'courses' });
Course.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 点赞关系
Course.hasMany(Like, { foreignKey: 'course_id', as: 'likes' });
Like.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
User.hasMany(Like, { foreignKey: 'user_id', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 课程章节
Course.hasMany(Chapter, { foreignKey: 'course_id', as: 'chapters' });
Chapter.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// 附件（用户删除后 user_id 置空，附件记录保留）
User.hasMany(Attachment, { foreignKey: 'user_id', as: 'attachments' });
Attachment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  Article,
  Setting,
  User,
  Category,
  Course,
  Like,
  Chapter,
  Attachment
};
