const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Articles', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    auther: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categories: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'articles',
  });
};
