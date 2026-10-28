const { success, fail } = require('../../utils/response');
const chartService = require('../../services/chart.service');

/**
 * GET /api/admin/charts/gender
 * 统计前台用户性别分布，返回各性别数量与占比（用于图表展示）
 */
async function getGenderChart(req, res, next) {
  try {
    const data = await chartService.getGenderDistribution();
    success(res, data);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/charts/monthly-users
 * 查询参数：
 *   year 选填，四位年份，只统计该年 1-12 月；不传则统计有数据以来的所有月份
 */
async function getMonthlyUsersChart(req, res, next) {
  try {
    let year;
    const raw = String(req.query.year || '').trim();
    if (raw) {
      if (!/^\d{4}$/.test(raw) || Number(raw) < 1970 || Number(raw) > 2100) {
        return fail(res, 400, 'year 参数无效，需为 1970-2100 之间的四位年份');
      }
      year = Number(raw);
    }

    const data = await chartService.getMonthlyUserCount({ year });
    success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getGenderChart,
  getMonthlyUsersChart
};
