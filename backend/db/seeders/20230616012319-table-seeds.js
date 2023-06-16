'use strict';
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = { 
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Tables';
    return queryInterface.bulkInsert(options, [

     {
      id: 'blackjack1-table1',
      gameId: 'blackjack1',
      cutPoint: 40,
      shufflePoint: 35,
     },
     {
      id: 'blackjack1-table2',
      gameId: 'blackjack1',
      cutPoint: 40,
      shufflePoint: 35,
     },
     {
      id: 'blackjack8-table1',
      gameId: 'blackjack8',
      cutPoint: 40,
      shufflePoint: 35,
     }

    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Tables';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {});
  }
};
 