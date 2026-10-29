const { Router } = require('express');
const { getGenderChart, getMonthlyUsersChart } = require('../../controllers/admin/chart.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { monthlyUsersQuerySchema } = require('../../validators/chart.validator');

const router = Router();

router.get('/gender', getGenderChart);
router.get('/monthly-users', validate({ query: monthlyUsersQuerySchema }), getMonthlyUsersChart);

module.exports = router;
