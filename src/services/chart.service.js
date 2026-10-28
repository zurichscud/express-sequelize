const { col, fn, literal, Op } = require('sequelize');
const { AppUser } = require('../models');

const SEXES = ['unknown', 'male', 'female'];

/**
 * 统计用户性别分布（数量与占比）
 * @returns {Promise<{ total: number, list: { sex: string, count: number, percent: number }[] }>}
 */
async function getGenderDistribution() {
  const rows = await AppUser.findAll({
    attributes: ['sex', [fn('COUNT', col('sex')), 'count']],
    group: ['sex']
  });

  // 按固定顺序兜底：没出现过的性别也返回 0，保证图表数据结构稳定
  const counts = Object.fromEntries(SEXES.map((sex) => [sex, 0]));
  let total = 0;
  for (const row of rows) {
    const count = Number(row.get('count'));
    counts[row.sex] = count;
    total += count;
  }

  const list = SEXES.map((sex) => ({
    sex,
    count: counts[sex],
    // 占比保留两位小数；无用户时占比为 0，避免除零
    percent: total === 0 ? 0 : Math.round((counts[sex] / total) * 10000) / 100
  }));

  return { total, list };
}

/**
 * 生成连续的月份序列（图表 x 轴），格式 YYYY-MM
 * @param {{ year?: number, months: string[] }} options
 *   指定 year 时固定返回该年 1-12 月；
 *   否则从最早有数据的月份补齐到当前月（最后数据月晚于当前月时以它为准），无数据返回空数组
 */
function buildMonthRange({ year, months }) {
  if (year) {
    return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
  }
  if (months.length === 0) {
    return [];
  }

  const [startYear, startMonth] = months[0].split('-').map(Number);
  const now = new Date();
  const [lastYear, lastMonth] = months[months.length - 1].split('-').map(Number);
  // 用 year*12+month 编码比较月份先后，终点取当前月与最后数据月的较大者
  const startKey = startYear * 12 + startMonth;
  const endKey = Math.max(now.getFullYear() * 12 + (now.getMonth() + 1), lastYear * 12 + lastMonth);

  const range = [];
  for (let key = startKey; key <= endKey; key++) {
    range.push(`${Math.floor((key - 1) / 12)}-${String(((key - 1) % 12) + 1).padStart(2, '0')}`);
  }
  return range;
}

/**
 * 统计每个月的用户注册数量
 * @param {{ year?: number }} [options] 传 year 只统计该年 12 个月，不传则统计有数据以来的所有月份
 * @returns {Promise<{ year: number|null, total: number, list: { month: string, count: number }[] }>}
 */
async function getMonthlyUserCount({ year } = {}) {
  const where = {};
  if (year) {
    // 用时间范围而非 YEAR(created_at) 函数过滤，查询可以走索引
    where.createdAt = {
      [Op.gte]: `${year}-01-01 00:00:00`,
      [Op.lt]: `${year + 1}-01-01 00:00:00`
    };
  }

  // 注意：col() 里用实际列名 created_at（全局 underscored 配置映射，col 不做属性名转换）
  const rows = await AppUser.findAll({
    attributes: [
      [fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'month'],
      [fn('COUNT', col('id')), 'count']
    ],
    where,
    group: [literal('month')],
    order: [[literal('month'), 'ASC']]
  });

  const countByMonth = new Map(rows.map((row) => [row.get('month'), Number(row.get('count'))]));
  // 没有用户的月份补 0，保证 x 轴连续
  const months = buildMonthRange({ year, months: [...countByMonth.keys()] });

  const list = months.map((month) => ({ month, count: countByMonth.get(month) || 0 }));
  const total = list.reduce((sum, item) => sum + item.count, 0);

  return { year: year || null, total, list };
}

module.exports = {
  getGenderDistribution,
  getMonthlyUserCount
};
