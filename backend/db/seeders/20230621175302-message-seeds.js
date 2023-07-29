'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Messages', [
      // General chat messages
      {
        userId: 'b16f9b4c-9d72-4e21-81ea-8fcf6a7987d7',
        conversationId: 'c1e6c24a-036b-43cd-aa53-bf32ee4ac77e',
        content: `Yo yooo! Bigtree's in the house`,
      },
      {
        userId: 'e10d8de4-f4c7-4d28-9324-56aa9c000001',
        conversationId: 'c1e6c24a-036b-43cd-aa53-bf32ee4ac77e',
        content: `What's up Bigtree!`,
      },
      {
        userId: '2da2c0a2-0de9-4275-a5e5-5d91e8b8533c',
        conversationId: 'c1e6c24a-036b-43cd-aa53-bf32ee4ac77e',
        content: `Hey guys! I'm Spruce!`,
      },
      {
        userId: '2da2c0a2-0de9-4275-a5e5-5d91e8b8533c',
        conversationId: 'c1e6c24a-036b-43cd-aa53-bf32ee4ac77e',
        content: `Lets get a game going!`,
      },
      {
        userId: '2da2c0a2-0de9-4275-a5e5-5d91e8b8533c',
        conversationId: 'c1e6c24a-036b-43cd-aa53-bf32ee4ac77e',
        content: `What should we play?`,
      },
    ],{});
  },

  down: async (queryInterface, Sequelize) => {


    options.tableName = 'Messages';
    return queryInterface.bulkDelete(options, {});
  },
};
