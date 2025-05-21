const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('UsersCoachTeam', {
        teamId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userCoachId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        inviteFirstName: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        inviteLastName: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        inviteEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        invitePhone: {
            type: DataTypes.CHAR(10),
            allowNull: true,
            validate: {
                isNumeric: true,
            },
        },
    }, {
    tableName: 'users_coach_team',
  });
};
