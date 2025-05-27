const { Sequelize } = require('sequelize');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
  },
  test: {
    database: process.env.DB_TEST_NAME,
    username: process.env.DB_TEST_USER,
    password: process.env.DB_TEST_PASSWORD,
    host: process.env.DB_TEST_HOST,
    port: process.env.DB_TEST_PORT,
  },
  production: {
    database: process.env.DB_PROD_NAME,
    username: process.env.DB_PROD_USER,
    password: process.env.DB_PROD_PASSWORD,
    host: process.env.DB_PROD_HOST,
    port: process.env.DB_PROD_PORT,
  }
};

const dbConf = config[env];

const sequelize = new Sequelize(
  dbConf.database,
  dbConf.username,
  dbConf.password,
  {
    host: dbConf.host,
    port: dbConf.port,
    dialect: 'mariadb',
    logging: false,
  }
);

module.exports = { sequelize };
