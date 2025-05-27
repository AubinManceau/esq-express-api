'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('convocations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      matchDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      matchHour: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      convocationHour: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
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

    await queryInterface.addIndex('convocations', ['teamId']);
    await queryInterface.addIndex('convocations', ['matchDate']);
    await queryInterface.addIndex('convocations', ['teamId', 'matchDate']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('convocations');
  }
};