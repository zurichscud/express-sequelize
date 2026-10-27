const { UniqueConstraintError } = require('sequelize');
const { Category, Course } = require('../models');

/**
 * 把唯一约束冲突转成带中文提示的业务错误
 * @param {UniqueConstraintError} err
 * @returns {Error}
 */
function toUniqueError(err) {
  const businessError = new Error('分类名称已存在');
  businessError.status = 400;
  return businessError;
}

/**
 * 查询分类列表，按 rank 升序排列（分类数量有限，不分页）
 * @returns {Promise<object[]>}
 */
async function listCategories() {
  return Category.findAll({
    order: [
      ['rank', 'ASC'],
      ['id', 'ASC']
    ]
  });
}

/**
 * 按 ID 查询分类详情
 * @param {number|string} id
 */
async function getCategoryById(id) {
  return Category.findByPk(id);
}

/**
 * 创建分类
 * @param {object} data
 */
async function createCategory(data) {
  try {
    return await Category.create(data);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw toUniqueError(err);
    }
    throw err;
  }
}

/**
 * 按 ID 更新分类（仅更新传入字段）
 * @param {number|string} id
 * @param {object} data
 * @returns {Promise<object|null>} 分类不存在时返回 null
 */
async function updateCategoryById(id, data) {
  const category = await Category.findByPk(id);
  if (!category) {
    return null;
  }

  try {
    await category.update(data);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw toUniqueError(err);
    }
    throw err;
  }
  return category;
}

/**
 * 按 ID 删除分类（分类下还有课程时拒绝删除）
 * @param {number|string} id
 * @returns {Promise<boolean>} 分类不存在时返回 false
 */
async function deleteCategoryById(id) {
  const category = await Category.findByPk(id);
  if (!category) {
    return false;
  }

  const courseCount = await Course.count({ where: { category_id: id } });
  if (courseCount > 0) {
    const businessError = new Error(`该分类下还有 ${courseCount} 门课程，无法删除`);
    businessError.status = 400;
    throw businessError;
  }

  await category.destroy();
  return true;
}

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById
};
