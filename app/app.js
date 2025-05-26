const express = require('express');
const { sequelize } = require('./config/database');
const initModels = require('./models/InitModels');
const userRoutes = require('./routes/user');
const articleRoutes = require('./routes/article');
const trainingRoutes = require('./routes/training');
const authRoutes = require('./routes/auth');
const seedRolesAndCategories = require('./seeders/seedRolesAndCategories');

const models = initModels(sequelize);

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

(async () => {
  try {
    await seedRolesAndCategories(models);
    console.log('✅ Rôles et catégories initialisés dans la base de données principale');
  } catch (err) {
    console.error('❌ Erreur pendant l’initialisation des rôles et catégories :', err);
  }
})();

module.exports = {
  app,
  models,
};
