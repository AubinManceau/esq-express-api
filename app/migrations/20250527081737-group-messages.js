'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      chatGroupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'chat_groups',
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

    await queryInterface.addIndex('group_messages', ['chatGroupId']);
    await queryInterface.addIndex('group_messages', ['senderId']);
    await queryInterface.addIndex('group_messages', ['sentAt']);
    await queryInterface.addIndex('group_messages', ['chatGroupId', 'sentAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('group_messages');
  }
};