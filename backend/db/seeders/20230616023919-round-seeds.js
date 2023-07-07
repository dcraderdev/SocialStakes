'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  
}

module.exports = { 
  up: async (queryInterface, Sequelize) => {
    // options.tableName = 'Rounds';
    // return queryInterface.bulkInsert(options, [
    //   // {
    //   //   // Round ID autoIncrements
    //   //   tableId: 'e10d8de4-f4c2-4d28-9324-56aa9c920801',
    //   //   active: false,
    //   //   cards: '10c 5h 7s',
    //   // },


    // ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // options.tableName = 'Rounds';
    // return queryInterface.bulkDelete(options, {});
  }
};
