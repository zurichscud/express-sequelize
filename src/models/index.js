const sequelize = require('../config/database');
const Article = require('./article.model');
const Setting = require('./setting.model');
const User = require('./user.model');
const Category = require('./category.model');
const Course = require('./course.model');

// 关联关系
Category.hasMany(Course, { foreignKey: 'category_id', as: 'courses' });
Course.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
User.hasMany(Course, { foreignKey: 'user_id', as: 'courses' });
Course.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  Article,
  Setting,
  User,
  Category,
  Course
};
