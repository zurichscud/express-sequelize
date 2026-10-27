const { Router } = require('express');
const { listCategories } = require('../../controllers/web/category.controller');

const router = Router();

router.get('/', listCategories);

module.exports = router;
