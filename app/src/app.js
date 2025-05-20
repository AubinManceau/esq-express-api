const express = require('express');
const { sequelize, sequelizeTest } = require('./config/database');
const initModels = require('./models/Index');
const userRoutes = require('./routes/user');
const articleRoutes = require('./routes/article');
const trainingRoutes = require('./routes/training');
const authRoutes = require('./routes/auth');
const seedRolesAndCategories = require('./seeders/seedRolesAndCategories');

const models = initModels(sequelize);
const testModels = initModels(sequelizeTest);

// BDD principale
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Base de données principale synchronisée avec Sequelize');
    return seedRolesAndCategories(models);
  })
  .then(() => {
    console.log('✅ Rôles et catégories initialisés dans la base de données principale');
  })
  .catch(error => {
    console.error('❌ Erreur de synchronisation de la base de données principale:', error);
  });

// BDD de test
sequelizeTest.sync({ force: true })
  .then(() => {
    console.log('✅ Base de données de test synchronisée avec Sequelize');
    return seedRolesAndCategories(testModels); 
  })
  .then(() => {
    console.log('✅ Rôles et catégories initialisés dans la base de données de test');
  })
  .catch(error => {
    console.error('❌ Erreur de synchronisation de la base de données de test:', error);
  });

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/trainings', trainingRoutes);

module.exports = app;
