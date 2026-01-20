import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export interface TrainingModel extends Model<InferAttributes<TrainingModel>, InferCreationAttributes<TrainingModel>> {
    id: CreationOptional<number>;
    type: 'match' | 'training';
    date: string;
    startTime: string;
    status: 'active' | 'canceled';
    categoryId: number;
}

export default (sequelize: Sequelize) => {
    return sequelize.define<TrainingModel>('Trainings', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        type: {
            type: DataTypes.ENUM('match', 'training'),
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        startTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'canceled'),
            allowNull: false,
            defaultValue: 'active',
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'trainings',
    });
};
