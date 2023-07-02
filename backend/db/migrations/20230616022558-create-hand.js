'use strict';
/** @type {import('sequelize-cli').Migration} */


let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Hands', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      userTableId: {
        allowNull: true,
        type: Sequelize.UUID,
        references: {
          model: 'UserTables',
        },
        onDelete: 'CASCADE'
      },
      roundId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Rounds',
        },
        onDelete: 'CASCADE'
      },
      cards:{
        type: Sequelize.STRING,
        defaultValue: ''
      },
      result:{
        type: Sequelize.STRING,
        defaultValue: ''
      },
      profitLoss:{
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    await queryInterface.dropTable('Hands',options);
  }
};