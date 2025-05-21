const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('UsersChatGroup', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    chatGroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  }, {
    tableName: 'users_chat_group',
  });
};
