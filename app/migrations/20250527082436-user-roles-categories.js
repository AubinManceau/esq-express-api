'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_roles_categories', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('user_roles_categories', ['userId']);
    await queryInterface.addIndex('user_roles_categories', ['roleId']);
    await queryInterface.addIndex('user_roles_categories', ['categoryId']);

    await queryInterface.addIndex(
      'user_roles_categories',
      ['userId', 'roleId', 'categoryId'],
      {
        unique: true,
        name: 'unique_user_role_category'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_roles_categories');
  }
};
