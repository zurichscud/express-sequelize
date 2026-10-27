const { Router } = require('express');
const { getSettings, updateSettings } = require('../../controllers/admin/setting.controller');

const router = Router();

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;
