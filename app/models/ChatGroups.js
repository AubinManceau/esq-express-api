import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define('ChatGroups', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'chat_groups',
  });
};
