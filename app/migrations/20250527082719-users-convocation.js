'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users_convocation', {
      convocationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'convocations', // Assure-toi que la table 'convocations' existe
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Assure-toi que la table 'users' existe
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
