'use strict';
/** @type {import('sequelize-cli').Migration} */


let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    return queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      firstName:{
        type: Sequelize.STRING(30),
        allowNull: false
      },
      lastName:{
        type: Sequelize.STRING(30),
        allowNull: false
      },
      username: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(256),
        allowNull: false,
        unique: true
      },
      hashedPassword: {
        type: Sequelize.STRING.BINARY,
        allowNull: false
      },
      balance: {
        type: Sequelize.INTEGER,
        defaultValue: 1000
      },
      isMuted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      rank: {
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
    }, options) 
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Users", options);
  }
};