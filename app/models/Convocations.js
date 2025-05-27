import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define('Convocations', {
    matchDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    matchHour: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    convocationHour: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'convocations',
  });
};
