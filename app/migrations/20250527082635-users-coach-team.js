'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users_coach_team', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userCoachId: {
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
      inviteEmail: {
        type: Sequelize.STRING,
        allowNull: true
      },
      invitePhone: {
        type: Sequelize.CHAR(10),
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

    await queryInterface.addIndex('users_coach_team', ['teamId']);
    await queryInterface.addIndex('users_coach_team', ['userCoachId']);
    await queryInterface.addIndex('users_coach_team', ['inviteEmail']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users_coach_team');
  }
};
