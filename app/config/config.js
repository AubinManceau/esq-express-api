import 'dotenv/config';

export default {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mariadb'
  },
  test: {
    username: process.env.DB_TEST_USER,
    password: process.env.DB_TEST_PASSWORD,
    database: process.env.DB_TEST_NAME,
    host: process.env.DB_TEST_HOST,
    port: process.env.DB_TEST_PORT || 3306,
    dialect: 'mariadb'
  },
  production: {
    username: process.env.DB_PROD_USER,
    password: process.env.DB_PROD_PASSWORD,
    database: process.env.DB_PROD_NAME,
    host: process.env.DB_PROD_HOST,
    port: process.env.DB_PROD_PORT || 3306,
    dialect: 'mariadb'
  }
};
