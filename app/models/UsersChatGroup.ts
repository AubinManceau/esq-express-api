import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface UsersChatGroupModel extends Model<InferAttributes<UsersChatGroupModel>, InferCreationAttributes<UsersChatGroupModel>> {
    userId: number;
    chatGroupId: number;
}

export default (sequelize: Sequelize) => {
    return sequelize.define<UsersChatGroupModel>('UsersChatGroup', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        chatGroupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
    }, {
        tableName: 'users_chat_group',
    });
};
