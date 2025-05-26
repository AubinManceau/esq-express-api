const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Categories', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'categories',
  });
};