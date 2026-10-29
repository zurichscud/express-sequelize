const { Router } = require('express');
const { listChapters, getChapter } = require('../../controllers/web/chapter.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { pagination } = require('../../middlewares/pagination.middleware');
const {
  chapterIdParamsSchema,
  webListChaptersQuerySchema
} = require('../../validators/chapter.validator');

const router = Router();

router.get(
  '/',
  pagination({ defaultPageSize: 20 }),
  validate({ query: webListChaptersQuerySchema }),
  listChapters
);
router.get('/:id', validate({ params: chapterIdParamsSchema }), getChapter);

module.exports = router;
