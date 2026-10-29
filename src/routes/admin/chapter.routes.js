const { Router } = require('express');
const {
  listChapters,
  createChapter,
  getChapter,
  updateChapter,
  deleteChapter
} = require('../../controllers/admin/chapter.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { pagination } = require('../../middlewares/pagination.middleware');
const {
  chapterIdParamsSchema,
  adminListChaptersQuerySchema,
  createChapterBodySchema,
  updateChapterBodySchema
} = require('../../validators/chapter.validator');

const router = Router();

router.get(
  '/',
  pagination(),
  validate({ query: adminListChaptersQuerySchema }),
  listChapters
);
router.post('/', validate({ body: createChapterBodySchema }), createChapter);
router.get('/:id', validate({ params: chapterIdParamsSchema }), getChapter);
router.put(
  '/:id',
  validate({ params: chapterIdParamsSchema, body: updateChapterBodySchema }),
  updateChapter
);
router.delete('/:id', validate({ params: chapterIdParamsSchema }), deleteChapter);

module.exports = router;
