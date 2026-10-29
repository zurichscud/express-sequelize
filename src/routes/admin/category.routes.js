const { Router } = require('express');
const {
  listCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory
} = require('../../controllers/admin/category.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  categoryIdParamsSchema,
  createCategoryBodySchema,
  updateCategoryBodySchema
} = require('../../validators/category.validator');

const router = Router();

router.get('/', listCategories);
router.post('/', validate({ body: createCategoryBodySchema }), createCategory);
router.get('/:id', validate({ params: categoryIdParamsSchema }), getCategory);
router.put(
  '/:id',
  validate({ params: categoryIdParamsSchema, body: updateCategoryBodySchema }),
  updateCategory
);
router.delete('/:id', validate({ params: categoryIdParamsSchema }), deleteCategory);

module.exports = router;
