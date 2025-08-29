import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define('GroupMessages', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chatGroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'group_messages',
  });
};
