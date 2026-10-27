const { Router } = require('express');
const adminRouter = require('./admin');

// /api 下按端划分：当前只有后台管理端，后续前台接口在这里并列注册
const router = Router();

router.use('/admin', adminRouter);

module.exports = router;
