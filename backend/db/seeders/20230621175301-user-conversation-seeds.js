'use strict';
const uuid = require('uuid');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('UserConversations', [
      {
        id: uuid.v4(),
        userId: 'b16f9b4c-9d72-4e21-81ea-8fcf6a7987d7',  //Bigtree
        conversationId: 'c1e6c24a-036b-43cd-aa53-bf32ee4ac77e',

      },
      {
        id: uuid.v4(),
        userId: 'e10d8de4-f4c7-4d28-9324-56aa9c000001', //Admin
        conversationId: 'c1e6c24a-036b-43cd-aa53-bf32ee4ac77e',

      },

      {
        id: uuid.v4(),
        userId: '2da2c0a2-0de9-4275-a5e5-5d91e8b8533c',  //Spruce
        conversationId: 'c1e6c24a-036b-43cd-aa53-bf32ee4ac77e',

      },
    

    ],{});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'UserConversations';
    return queryInterface.bulkDelete(options, {});
  },
};
