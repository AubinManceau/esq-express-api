import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define('Trainings', {
    type: {
      type: DataTypes.ENUM('match', 'training'),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'canceled'),
      allowNull: false,
      defaultValue: 'active',
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'trainings',
  });
};
