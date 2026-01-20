import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export interface TeamModel extends Model<InferAttributes<TeamModel>, InferCreationAttributes<TeamModel>> {
    id: CreationOptional<number>;
    name: string;
    division: string;
    categoryId: number;
}

export default (sequelize: Sequelize) => {
    return sequelize.define<TeamModel>('Teams', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        division: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'teams',
    });
};
