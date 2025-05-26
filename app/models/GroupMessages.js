const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('GroupMessages', {
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
    chatGroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'group_messages',
  });
};
