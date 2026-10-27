const { Router } = require('express');
const { getSettings } = require('../../controllers/web/setting.controller');

const router = Router();

// /api/settings 与 /api/system/info 均返回站点信息
router.get('/', getSettings);
router.get('/info', getSettings);

module.exports = router;
