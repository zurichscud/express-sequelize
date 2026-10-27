const { Router } = require('express');
const {
  listCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');

const router = Router();

router.get('/', listCategories);
router.post('/', createCategory);
router.get('/:id', getCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
