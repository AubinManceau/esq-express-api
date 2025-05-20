const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Trainings', {
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
  }, {
    tableName: 'trainings',
  });
};
