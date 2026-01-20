import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export interface GroupMessageModel extends Model<InferAttributes<GroupMessageModel>, InferCreationAttributes<GroupMessageModel>> {
    id: CreationOptional<number>;
    content: string;
    senderId: number;
    chatGroupId: number;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}

export default (sequelize: Sequelize) => {
    return sequelize.define<GroupMessageModel>('GroupMessages', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        senderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        chatGroupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        tableName: 'group_messages',
    });
};
