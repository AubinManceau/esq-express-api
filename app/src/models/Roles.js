const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Roles', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'roles',
  });
};