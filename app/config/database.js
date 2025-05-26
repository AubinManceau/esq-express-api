const { Sequelize } = require('sequelize');
require('dotenv').config();

// Connexion à la base de données principale
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mariadb',
    logging: false,
  }
);

// Connexion à la base de test
const sequelizeTest = new Sequelize(
  process.env.DB_TEST_NAME,
  process.env.DB_TEST_USER,
  process.env.DB_TEST_PASSWORD,
  {
    host: process.env.DB_TEST_HOST,
    port: process.env.DB_TEST_PORT || 3306,
    dialect: 'mariadb',
    logging: true,
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ Connexion à la base principale OK'))
  .catch(err => console.error('❌ Erreur connexion DB principale :', err));

sequelizeTest.authenticate()
  .then(() => console.log('✅ Connexion à la base de test OK'))
  .catch(err => console.error('❌ Erreur connexion DB test :', err));

module.exports = {
  sequelize,
  sequelizeTest
};
