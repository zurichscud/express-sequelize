const { Router } = require('express');
const { getSettings, updateSettings } = require('../controllers/setting.controller');

const router = Router();

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;
