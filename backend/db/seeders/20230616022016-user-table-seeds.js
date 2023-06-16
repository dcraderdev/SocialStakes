'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  
}

module.exports = { 
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'UserTables';
    return queryInterface.bulkInsert(options, [
      {
        id: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fbba',
        userId: 'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b', // Trina Pine
        tableId: 'e10d8de4-f4c2-4d28-9324-56aa9c920801',
        seat: 1,
      },
      {
        id: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fbbb',
        userId: '87d1cb3a-b8e2-4c7e-9d80-462a523b0fcb', // Hazel Forest
        tableId: 'e10d8de4-f4c2-4d28-9324-56aa9c920801',
        seat: 2,
      },
      {
        id: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fbbc',
        userId: '2da2c0a2-0de9-4275-a5e5-5d91e8b8533c', // Oak Branch
        tableId: 'e10d8de4-f4c2-4d28-9324-56aa9c920801',
        seat: 4,
      },
      {
        id: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fbbd',
        userId:'a83139c5-f4c2-4fc2-a223-9c9c8085f30d', // Willow
        tableId: 'e10d8de4-f4c2-4d28-9324-56aa9c920802',
        seat: 1,
      },
      {
        id: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fbbe',
        userId:'e10d8de4-f4cd-4d28-9324-56aa9c924a79', // Maple
        tableId: 'e10d8de4-f4c2-4d28-9324-56aa9c920802',
        seat: 2,
      },
      {
        id: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fbbf',
        userId:'e10d8de4-f4c2-4d28-9324-56aa9c924a80', // Birch
        tableId: 'e10d8de4-f4c2-4d28-9324-56aa9c920802',
        seat: 4,
      },




    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'UserTables';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {});
  }
};
