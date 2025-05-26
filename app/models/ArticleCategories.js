const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ArticleCategories', {
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  }, {
    tableName: 'article_categories',
  });
};
