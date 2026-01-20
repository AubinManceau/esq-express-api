import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export interface ChatGroupModel extends Model<InferAttributes<ChatGroupModel>, InferCreationAttributes<ChatGroupModel>> {
    id: CreationOptional<number>;
    name: string;
    categoryId: number | null;
    roleId: number | null;
}

export default (sequelize: Sequelize) => {
    return sequelize.define<ChatGroupModel>('ChatGroups', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        roleId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        tableName: 'chat_groups',
    });
};
