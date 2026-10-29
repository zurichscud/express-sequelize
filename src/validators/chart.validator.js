const { z } = require('zod');

const YEAR_MESSAGE = 'year 参数无效，需为 1970-2100 之间的四位年份';

const monthlyUsersQuerySchema = z.object({
  year: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce
      .number({ error: YEAR_MESSAGE })
      .int(YEAR_MESSAGE)
      .min(1970, YEAR_MESSAGE)
      .max(2100, YEAR_MESSAGE)
      .optional()
  )
});

module.exports = {
  monthlyUsersQuerySchema
};
