const { Router } = require('express');
const { listArticles, getArticle } = require('../../controllers/web/article.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { pagination } = require('../../middlewares/pagination.middleware');
const {
  articleIdParamsSchema,
  webListArticlesQuerySchema
} = require('../../validators/article.validator');

const router = Router();

router.get(
  '/',
  pagination({ maxPageSize: 50 }),
  validate({ query: webListArticlesQuerySchema }),
  listArticles
);
router.get('/:id', validate({ params: articleIdParamsSchema }), getArticle);

module.exports = router;
