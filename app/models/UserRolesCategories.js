const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('UserRolesCategories', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'user_roles_categories',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'roleId', 'categoryId']
      }
    ],
    hooks: {
      beforeValidate: (userRoleCategory) => {
        if ((userRoleCategory.roleId === 1 || userRoleCategory.roleId === 2) && !userRoleCategory.categoryId) {
          throw new Error('La catégorie est requise pour les rôles joueur et coach.');
        }
      }
    }
  });
};
