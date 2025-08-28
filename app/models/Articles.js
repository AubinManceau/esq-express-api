import { DataTypes } from 'sequelize';

export default (sequelize) => {
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
    date: {
      type: DataTypes.DATE,
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
