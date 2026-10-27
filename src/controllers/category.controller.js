const { success, fail } = require('../utils/response');
const categoryService = require('../services/category.service');

// 字段白名单
const EDITABLE_FIELDS = ['name', 'rank'];

// 只允许客户端提交可编辑字段，字段级校验统一交给模型
function pickCategoryFields(body) {
  const source = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const payload = {};
  for (const field of EDITABLE_FIELDS) {
    if (source[field] !== undefined) {
      payload[field] = source[field];
    }
  }
  return payload;
}

/**
 * GET /api/categories
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
 * POST /api/categories
 * 请求体：
 *   name 必填，分类名称，唯一，最长 64 字
 *   rank 选填，排序序号，越小越靠前，默认 0
 */
async function createCategory(req, res, next) {
  try {
    const category = await categoryService.createCategory(pickCategoryFields(req.body));

    success(res, category, { status: 201 });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/categories/:id
 * 查询单个分类详情
 */
async function getCategory(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '分类 ID 无效');
    }

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
 * PUT /api/categories/:id
 * 更新分类（仅更新请求体中提供的字段）
 * 请求体：
 *   name 选填，分类名称，唯一，最长 64 字
 *   rank 选填，排序序号
 */
async function updateCategory(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '分类 ID 无效');
    }

    const payload = pickCategoryFields(req.body);
    if (!Object.keys(payload).length) {
      return fail(res, 400, '没有需要更新的字段');
    }

    const category = await categoryService.updateCategoryById(id, payload);
    if (!category) {
      return fail(res, 404, '分类不存在');
    }

    success(res, category);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/categories/:id
 * 删除分类（分类下还有课程时拒绝删除）
 */
async function deleteCategory(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return fail(res, 400, '分类 ID 无效');
    }

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
