const { Router } = require('express');
const { listChapters, getChapter } = require('../../controllers/web/chapter.controller');

const router = Router();

router.get('/', listChapters);
router.get('/:id', getChapter);

module.exports = router;
