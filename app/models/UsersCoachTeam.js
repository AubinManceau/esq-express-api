import { DataTypes } from "sequelize";

export default (sequelize) => {
    return sequelize.define('UsersCoachTeam', {
        teamId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        userCoachId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        }
    }, {
    tableName: 'users_coach_team',
  });
};
