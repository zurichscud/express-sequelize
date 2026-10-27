const { Router } = require('express');
const {
  listChapters,
  createChapter,
  getChapter,
  updateChapter,
  deleteChapter
} = require('../../controllers/admin/chapter.controller');

const router = Router();

router.get('/', listChapters);
router.post('/', createChapter);
router.get('/:id', getChapter);
router.put('/:id', updateChapter);
router.delete('/:id', deleteChapter);

module.exports = router;
