'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('training_users_status', {
      trainingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'trainings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'absent', 'present'),
        allowNull: false,
        defaultValue: 'pending'
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

    await queryInterface.addIndex('training_users_status', ['trainingId']);
    await queryInterface.addIndex('training_users_status', ['userId']);
    await queryInterface.addIndex('training_users_status', ['status']);
    await queryInterface.addIndex('training_users_status', ['trainingId', 'userId'], {
      unique: true,
      name: 'training_users_status_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('training_users_status');
  }
};
