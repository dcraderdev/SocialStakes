'use strict';
/** @type {import('sequelize-cli').Migration} */


let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserTables', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      tableId: {
        type: Sequelize.UUID,
        references: {
          model: 'Tables',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      seat:{
        type: Sequelize.INTEGER
      },
      tableBalance:{
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    },options);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserTables',options);
  }
};