const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Training = sequelize.define('Training', {
  type: {
    type: DataTypes.ENUM('match', 'entrainement'),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled'),
    allowNull: false,
    defaultValue: 'active',
  },
});

module.exports = Training;
