import { DataTypes } from "sequelize";

export default (sequelize) => {
    return sequelize.define('UsersConvocation', {
        convocationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        inviteFirstName: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        inviteLastName: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    }, {
    tableName: 'users_convocation',
  });
};
