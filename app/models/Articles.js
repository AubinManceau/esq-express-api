import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Articles', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },
    userAuthorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'articles',
  });
};
