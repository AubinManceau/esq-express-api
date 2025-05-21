const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Teams', {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'teams',
  });
};
