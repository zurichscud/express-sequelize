const { success } = require('../../utils/response');
const categoryService = require('../../services/category.service');

/**
 * GET /api/categories
 * 前台分类列表（按 rank 升序）
 */
async function listCategories(req, res, next) {
  try {
    const list = await categoryService.listCategories();
    success(res, list);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCategories
};
