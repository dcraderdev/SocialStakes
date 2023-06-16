'use strict';
/** @type {import('sequelize-cli').Migration} */


let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Games', {
      id: {
        primaryKey: true,
        type: Sequelize.STRING
      },
      gameType: {
        allowNull: false,
        type: Sequelize.STRING
      },
      variant: {
        allowNull: false,
        type: Sequelize.STRING
      },
      decksUsed: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      minNumPlayers: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      maxNumPlayers: {
        type: Sequelize.INTEGER,
        defaultValue: 6
      },
      smallBlind: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      bigBlind: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      minBet: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      maxBet: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    },options);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Games', options);
  }
};





