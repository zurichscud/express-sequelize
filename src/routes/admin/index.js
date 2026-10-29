const { Router } = require('express');
const articleRouter = require('./article.routes');
const settingRouter = require('./setting.routes');
const sysUserRouter = require('./sysUser.routes');
const appUserRouter = require('./appUser.routes');
const categoryRouter = require('./category.routes');
const courseRouter = require('./course.routes');
const chapterRouter = require('./chapter.routes');
const chartRouter = require('./chart.routes');
const uploadRouter = require('./upload.routes');
const attachmentRouter = require('./attachment.routes');
const { login } = require('../../controllers/admin/sysUser.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { loginBodySchema } = require('../../validators/user.validator');

const router = Router();

// 后台登录接口公开；其余后台接口统一要求携带 JWT
router.post('/users/login', validate({ body: loginBodySchema }), login);
router.use(authenticate);

router.use('/articles', articleRouter);
router.use('/settings', settingRouter);
router.use('/users', sysUserRouter);
router.use('/app-users', appUserRouter);
router.use('/categories', categoryRouter);
router.use('/courses', courseRouter);
router.use('/chapters', chapterRouter);
router.use('/charts', chartRouter);
router.use('/uploads', uploadRouter);
router.use('/attachments', attachmentRouter);

module.exports = router;
