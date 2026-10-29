const { success, fail } = require('../../utils/response');
const categoryService = require('../../services/category.service');

/**
 * GET /api/admin/categories
 * 查询分类列表，按 rank 升序排列（不分页）
 */
async function listCategories(req, res, next) {
  try {
    const list = await categoryService.listCategories();
    success(res, { list });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/categories
 * 创建分类（请求体字段与格式由 category.validator.js 校验）
 *   name 必填，分类名称，唯一，最长 64 字
 *   rank 选填，排序序号，越小越靠前，默认 0
 */
async function createCategory(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.validated.body);

    success(res, category, { status: 201 });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/categories/:id
 * 查询单个分类详情
 */
async function getCategory(req, res, next) {
  try {
    const { id } = req.validated.params;

    const category = await categoryService.getCategoryById(id);
    if (!category) {
      return fail(res, 404, '分类不存在');
    }

    success(res, category);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/categories/:id
 * 更新分类（仅更新请求体中提供的字段）
 *   name 选填，分类名称，唯一，最长 64 字
 *   rank 选填，排序序号
 */
async function updateCategory(req, res, next) {
  try {
    const { id } = req.validated.params;

    const category = await categoryService.updateCategoryById(id, req.validated.body);
    if (!category) {
      return fail(res, 404, '分类不存在');
    }

    success(res, category);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/categories/:id
 * 删除分类（分类下还有课程时拒绝删除）
 */
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.validated.params;

    const deleted = await categoryService.deleteCategoryById(id);
    if (!deleted) {
      return fail(res, 404, '分类不存在');
    }

    success(res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory
};
