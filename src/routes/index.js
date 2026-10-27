const { Router } = require('express');
const adminRouter = require('./admin');
const webRouter = require('./web');

// /api 下按端划分：/admin 为后台管理端，其余为前台公开接口
const router = Router();

router.use('/admin', adminRouter);
router.use('/', webRouter);

module.exports = router;
