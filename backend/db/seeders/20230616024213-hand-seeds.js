'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  
}

module.exports = { 
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Hands';
    return queryInterface.bulkInsert(options, [
      {
        id: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fffa',
        userTableId: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fbba', // Trina Pine
        roundId: 1,
        cards: '2h 14s',
        result: 'WIN',
        profitLoss: 50
      },
      // {
      //   id: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fffb',
      //   userTableId: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fbbb', // Hazel Forest
      //   roundId: 1,
      //   cards: '2d 13s 7c'
      // },



    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Hands';
    return queryInterface.bulkDelete(options, {});
  }
};
