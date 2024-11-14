const express = require('express');
const sequelize = require('./config/database');
require('./models');
const userRoutes = require('./routes/user');
const articleRoutes = require('./routes/article');
const trainingRoutes = require('./routes/training');
const seedRolesAndCategories = require('./seeders/seedRolesAndCategories');

sequelize.sync()
  .then(() => console.log('Base de données synchronisée avec Sequelize', seedRolesAndCategories()))
  .catch(error => console.error('Erreur de synchronisation de la base de données:', error));

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());
app.use('/api/auth', userRoutes);
app.use('/api/article', articleRoutes);
app.use('/api/training', trainingRoutes);

module.exports = app;
