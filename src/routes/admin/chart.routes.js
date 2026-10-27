const { Router } = require('express');
const { getGenderChart, getMonthlyUsersChart } = require('../../controllers/admin/chart.controller');

const router = Router();

router.get('/gender', getGenderChart);
router.get('/monthly-users', getMonthlyUsersChart);

module.exports = router;
