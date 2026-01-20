import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export interface ArticleModel extends Model<InferAttributes<ArticleModel>, InferCreationAttributes<ArticleModel>> {
    id: CreationOptional<number>;
    title: string;
    content: any; // JSON type
    status: 'draft' | 'published' | 'archived';
    userAuthorId: number | null;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}

export default (sequelize: Sequelize) => {
    return sequelize.define<ArticleModel>('Articles', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('draft', 'published', 'archived'),
            defaultValue: 'draft',
        },
        userAuthorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        tableName: 'articles',
    });
};
