'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users_convocation', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      convocationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
