const { Sequelize } = require('sequelize');
const configs = require('./config');

const env = process.env.NODE_ENV || 'development';
const config = configs[env] || configs.development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  timezone: config.timezone,
  logging: config.logging,
  define: config.define,
  dialectOptions: config.dialectOptions,
  pool: config.pool
});

module.exports = sequelize;
