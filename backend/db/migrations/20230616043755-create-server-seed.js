'use strict';
/** @type {import('sequelize-cli').Migration} */


let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const uuid = require('uuid');


module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ServerSeeds', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      gameSessionId: {
        type: Sequelize.UUID,
        references: {
          model: 'GameSessions',
        },
        onDelete: 'CASCADE'
      },
      serverSeed: {
        type: Sequelize.STRING
      },
      used: {
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
    await queryInterface.dropTable('ServerSeeds',options);
  }
};