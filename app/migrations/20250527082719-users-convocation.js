'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users_convocation', {
      convocationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'convocations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      inviteFirstName: {
        type: Sequelize.STRING(30),
        allowNull: true
      },
      inviteLastName: {
        type: Sequelize.STRING(50),
        allowNull: true
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

    await queryInterface.addIndex('users_convocation', ['convocationId']);
    await queryInterface.addIndex('users_convocation', ['userId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users_convocation');
  }
};
