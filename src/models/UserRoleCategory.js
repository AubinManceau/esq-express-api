const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const Category = require('./Category');

const UserRoleCategory = sequelize.define('UserRoleCategory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: Role,
      key: 'id',
    },
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: Category,
      key: 'id',
    },
    allowNull: true,
  },
}, {
  indexes:[
    {
      unique: true,
      fields:['userId', 'roleId', 'categoryId'] 
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

module.exports = UserRoleCategory;
