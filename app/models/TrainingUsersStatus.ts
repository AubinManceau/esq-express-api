import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface TrainingUsersStatusModel extends Model<InferAttributes<TrainingUsersStatusModel>, InferCreationAttributes<TrainingUsersStatusModel>> {
    trainingId: number;
    userId: number;
    status: 'pending' | 'absent' | 'present';
}

export default (sequelize: Sequelize) => {
    return sequelize.define<TrainingUsersStatusModel>('TrainingUsersStatus', {
        trainingId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
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
