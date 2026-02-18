import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, Transaction } from 'sequelize';

export interface ConvocationModel extends Model<InferAttributes<ConvocationModel>, InferCreationAttributes<ConvocationModel>> {
    id: CreationOptional<number>;
    matchDate: string;
    matchHour: string;
    convocationHour: string;
    location: string;
    teamId: number;
}

export default (sequelize: Sequelize) => {
    return sequelize.define<ConvocationModel>('Convocations', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        matchDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        matchHour: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        convocationHour: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        teamId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'convocations',
    });
};
