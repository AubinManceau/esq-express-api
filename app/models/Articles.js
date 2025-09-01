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
    userAuthorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'articles',
  });
};
