const { Router } = require('express');
const {
  listArticles,
  createArticle,
  getArticle,
  updateArticle,
  deleteArticle
} = require('../../controllers/admin/article.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { pagination } = require('../../middlewares/pagination.middleware');
const {
  articleIdParamsSchema,
  adminListArticlesQuerySchema,
  createArticleBodySchema,
  updateArticleBodySchema
} = require('../../validators/article.validator');

const router = Router();

router.get(
  '/',
  pagination(),
  validate({ query: adminListArticlesQuerySchema }),
  listArticles
);
router.post('/', validate({ body: createArticleBodySchema }), createArticle);
router.get('/:id', validate({ params: articleIdParamsSchema }), getArticle);
router.put(
  '/:id',
  validate({ params: articleIdParamsSchema, body: updateArticleBodySchema }),
  updateArticle
);
router.delete('/:id', validate({ params: articleIdParamsSchema }), deleteArticle);

module.exports = router;
