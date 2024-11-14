const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Training = require('./Training');
const User = require('./User');

const TrainingUserStatus = sequelize.define('TrainingUserStatus', {
    trainingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Training,
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('notResponded', 'absent', 'present'),
        allowNull: false,
        defaultValue: 'notResponded'
    }
});

module.exports = TrainingUserStatus;
