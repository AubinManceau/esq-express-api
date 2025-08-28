import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define('Users', {
    firstName: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.CHAR(10),
      allowNull: true,
      validate: {
        isNumeric: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'users',
  });
};
