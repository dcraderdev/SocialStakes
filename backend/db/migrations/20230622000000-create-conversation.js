'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Conversations', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      tableId: {
        allowNull: true,
        type: Sequelize.STRING,
        references: {
          model: 'Tables',
          key: 'id',
        },
      },
      chatName: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      hasDefaultChatName: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isDirectMessage: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Conversations', options);
  }
};
