import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface UsersConvocationModel extends Model<InferAttributes<UsersConvocationModel>, InferCreationAttributes<UsersConvocationModel>> {
    convocationId: number;
    userId: number;
}

export default (sequelize: Sequelize) => {
    return sequelize.define<UsersConvocationModel>('UsersConvocation', {
        convocationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    }, {
        tableName: 'users_convocation',
    });
};
