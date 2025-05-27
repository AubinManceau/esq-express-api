import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define('PrivateMessages', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'private_messages',
  });
};
