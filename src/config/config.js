require('dotenv').config({ quiet: true });

const base = {
  username: process.env.DB_USER || 'app',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'express_sequelize',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  timezone: '+08:00',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  define: {
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  dialectOptions: {
    charset: 'utf8mb4',
    // DATETIME 以字符串返回，避免时区二次转换
    dateStrings: true
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // 迁移/种子记录写入数据库，便于团队协作和 CI 追踪
  migrationStorage: 'sequelize',
  seederStorage: 'sequelize'
};

const buildConfig = (overrides = {}) => ({ ...base, ...overrides });

module.exports = {
  development: buildConfig(),
  test: buildConfig({
    database: process.env.DB_NAME_TEST || `${base.database}_test`
  }),
  production: buildConfig()
};
