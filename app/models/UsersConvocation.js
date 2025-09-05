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
        }
    }, {
    tableName: 'users_convocation',
  });
};
