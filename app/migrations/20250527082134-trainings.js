'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('trainings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.ENUM('match', 'training'),
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'canceled'),
        allowNull: false,
        defaultValue: 'active',
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
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

    await queryInterface.addIndex('trainings', ['categoryId']);
    await queryInterface.addIndex('trainings', ['type']);
    await queryInterface.addIndex('trainings', ['date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('trainings');
  }
};
