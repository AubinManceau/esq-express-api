const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Convocations', {
    matchDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    matchHour: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    convocationHour: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'convocations',
  });
};
