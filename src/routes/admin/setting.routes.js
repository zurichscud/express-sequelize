const { Router } = require('express');
const { getSettings, updateSettings } = require('../../controllers/admin/setting.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { updateSettingBodySchema } = require('../../validators/setting.validator');

const router = Router();

router.get('/', getSettings);
router.put('/', validate({ body: updateSettingBodySchema }), updateSettings);

module.exports = router;
