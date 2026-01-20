import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface UsersCoachTeamModel extends Model<InferAttributes<UsersCoachTeamModel>, InferCreationAttributes<UsersCoachTeamModel>> {
    teamId: number;
    userCoachId: number;
}

export default (sequelize: Sequelize) => {
    return sequelize.define<UsersCoachTeamModel>('UsersCoachTeam', {
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
