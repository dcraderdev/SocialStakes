'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = { 
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Tables';
    return queryInterface.bulkInsert(options, [

     {
      id: 'e10d8de4-f4c2-4d28-9324-56aa9c920801',
      gameId: 'blackjack1',
      cutPoint: 40,
      shufflePoint: 35,
      tableBalance: 0
     },
     {
      id: 'e10d8de4-f4c2-4d28-9324-56aa9c920802',
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
 