const { Router } = require('express');
const settingRouter = require('./setting.routes');
const categoryRouter = require('./category.routes');
const courseRouter = require('./course.routes');
const chapterRouter = require('./chapter.routes');
const articleRouter = require('./article.routes');
const authRouter = require('./auth.routes');
const likeRouter = require('./like.routes');

// 前台接口：公开接口无需登录，个人资料与点赞接口单独校验前台登录态
const router = Router();

router.use('/auth', authRouter);
router.use('/settings', settingRouter);
router.use('/system', settingRouter);
router.use('/categories', categoryRouter);
router.use('/courses', courseRouter);
router.use('/chapters', chapterRouter);
router.use('/articles', articleRouter);
router.use('/likes', likeRouter);

module.exports = router;
