import { DataTypes } from "sequelize";

export default (sequelize) => {
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