'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  
}

module.exports = { 
  up: async (queryInterface, Sequelize) => {
    // options.tableName = 'UserTables';
    // return queryInterface.bulkInsert(options, [
      // {
      //   id: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fbba',
      //   userId: 'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b', // Trina Pine
      //   tableId: 'e10d8de4-f4c2-4d28-9324-56aa9c920801',
      //   seat: 1,
      //   tableBalance: 150,
      //   active: true
      // },
      // {
      //   id: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fbbb',
      //   userId: '87d1cb3a-b8e2-4c7e-9d80-462a523b0fcb', // Hazel Forest
      //   tableId: 'e10d8de4-f4c2-4d28-9324-56aa9c920801',
      //   seat: 2,
      //   tableBalance: 50
      // },





    // ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // options.tableName = 'UserTables';
    // const Op = Sequelize.Op;
    // return queryInterface.bulkDelete(options, {});
  }
};
