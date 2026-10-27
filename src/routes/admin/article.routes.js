const { Router } = require('express');
const {
  listArticles,
  createArticle,
  getArticle,
  updateArticle,
  deleteArticle
} = require('../../controllers/admin/article.controller');

const router = Router();

router.get('/', listArticles);
router.post('/', createArticle);
router.get('/:id', getArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);

module.exports = router;
