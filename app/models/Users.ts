import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export interface UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
    id: CreationOptional<number>;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    licence: string | null;
    password: string | null;
    photo: string | null;
    photo_celebration: string | null;
    isActive: boolean;
    refreshToken: string | null;

    // Timestamps
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}

export default (sequelize: Sequelize) => {
    return sequelize.define<UserModel>('Users', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        firstName: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        phone: {
            type: DataTypes.CHAR(10),
            allowNull: true,
            validate: {
                isNumeric: true,
            },
        },
        licence: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        photo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        photo_celebration: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        refreshToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        tableName: 'users',
    });
};
