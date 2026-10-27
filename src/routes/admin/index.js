const { Router } = require('express');
const articleRouter = require('./article.routes');
const settingRouter = require('./setting.routes');
const userRouter = require('./user.routes');
const categoryRouter = require('./category.routes');
const courseRouter = require('./course.routes');
const chapterRouter = require('./chapter.routes');
const chartRouter = require('./chart.routes');
const { login } = require('../../controllers/admin/user.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = Router();

// 后台登录接口公开；其余后台接口统一要求携带 JWT
router.post('/users/login', login);
router.use(authenticate);

router.use('/articles', articleRouter);
router.use('/settings', settingRouter);
router.use('/users', userRouter);
router.use('/categories', categoryRouter);
router.use('/courses', courseRouter);
router.use('/chapters', chapterRouter);
router.use('/charts', chartRouter);

module.exports = router;
