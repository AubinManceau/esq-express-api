const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
});

sequelize.authenticate()
  .then(() => console.log('Connexion à SQLite réussie !'))
  .catch((error) => console.error('Erreur de connexion à SQLite :', error));

module.exports = sequelize;
