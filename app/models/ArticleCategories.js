import { DataTypes } from 'sequelize';

export default (sequelize) => {
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
