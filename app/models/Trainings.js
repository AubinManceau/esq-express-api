const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Trainings', {
    type: {
      type: DataTypes.ENUM('match', 'training'),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled'),
      allowNull: false,
      defaultValue: 'active',
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'trainings',
  });
};
