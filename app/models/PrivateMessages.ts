import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export interface PrivateMessageModel extends Model<InferAttributes<PrivateMessageModel>, InferCreationAttributes<PrivateMessageModel>> {
    id: CreationOptional<number>;
    content: string;
    senderId: number;
    receiverId: number;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}

export default (sequelize: Sequelize) => {
    return sequelize.define<PrivateMessageModel>('PrivateMessages', {
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
        receiverId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        tableName: 'private_messages',
    });
};
