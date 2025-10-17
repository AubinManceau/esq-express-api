import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define('Teams', {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    division: {
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
