const { sequelize } = require('../config/database');
const initModels = require('./InitModels');

const models = initModels(sequelize);
module.exports = models;