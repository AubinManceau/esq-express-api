const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('TrainingUsersStatus', {
        trainingId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'absent', 'present'),
            allowNull: false,
            defaultValue: 'pending'
        }
    }, {
    tableName: 'training_users_status',
  });
};
