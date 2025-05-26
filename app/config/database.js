const { Sequelize } = require('sequelize');
require('dotenv').config();

const env = process.env.NODE_ENV;

const sequelize = new Sequelize(
  env === 'prod' ? process.env.DB_PROD_NAME : process.env.DB_NAME,
  env === 'prod' ? process.env.DB_PROD_USER : process.env.DB_USER,
  env === 'prod' ? process.env.DB_PROD_PASSWORD : process.env.DB_PASSWORD,
  {
    host: env === 'prod' ? process.env.DB_PROD_HOST : process.env.DB_HOST,
    port: env === 'prod' ? process.env.DB_PROD_PORT : process.env.DB_PORT,
    dialect: 'mariadb',
    logging: false,
  }
);

let sequelizeTest = null;

if (env !== 'prod') {
  sequelizeTest = new Sequelize(
    process.env.DB_TEST_NAME,
    process.env.DB_TEST_USER,
    process.env.DB_TEST_PASSWORD,
    {
      host: process.env.DB_TEST_HOST,
      port: process.env.DB_TEST_PORT,
      dialect: 'mariadb',
      logging: false,
    }
  );
}

module.exports = {
  sequelize,
  sequelizeTest,
};
