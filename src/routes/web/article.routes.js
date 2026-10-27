const { Router } = require('express');
const { listArticles, getArticle } = require('../../controllers/web/article.controller');

const router = Router();

router.get('/', listArticles);
router.get('/:id', getArticle);

module.exports = router;
