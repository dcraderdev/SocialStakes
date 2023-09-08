'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}


module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Conversations';

    await queryInterface.bulkInsert(options, [
      {
        id: '9e4384d0-83f1-4a02-8e29-016736c97211',
        tableId: 'e10d8de4-f4c2-4d28-9324-56aa9c920801',
        chatName: 'Eureka - American 21',
        hasDefaultChatName: false,
      },
      {
        id: 'd6d2e907-3b01-4341-b3ca-cb740847b5b0',
        tableId: '62a1650f-7e96-4e36-a89f-6de17e145be1',
        hasDefaultChatName: false,
        chatName: 'Santa Rosa - American 21',
      },
      {
        id: 'e9d4091e-754e-46e6-a5a9-41f2a9dabf91',
        tableId: 'f14c6d8a-347c-4e6a-ae9b-0a8b708fb4a7',
        hasDefaultChatName: false,
        chatName: 'Santa Cruz - American 21',
      },
      {
        id: 'c83a2ca2-5ce9-4a1c-ba3b-39e4a44ffabf',
        tableId: 'a1e6c3f7-2f4d-41f1-89a4-1e672e1f4857',
        hasDefaultChatName: false,
        chatName: 'Fresno - American 21',
      },
      {
        id: '675aad5e-e51c-47fc-839c-2998c3831dcb',
        tableId: 'ee828376-6f33-4d2c-b5c0-07c6b8762e2f',
        hasDefaultChatName: false,
        chatName: 'San Luis Obispo - American 21',
      },
      {
        id: 'd7c9670a-1287-4873-b405-5f4d769c6921',
        tableId: 'bda7360c-10a2-4ee9-a4d2-3e41f688d641',
        hasDefaultChatName: false,
        chatName: 'Ventura - American 21',
      },
      {
        id: '5b45125f-0809-478c-9d67-28737c6d13de',
        tableId: '0bdeed9a-6ce4-4a06-8470-3ddfc0fcdf2b',
        hasDefaultChatName: false,
        chatName: 'Santa Barbara - American 21',
      },
      {
        id: '61c9c0eb-c741-4c6d-99d5-124f7e1b46dd',
        tableId: 'b2866e5a-bb89-47ea-b30b-6d1a677f0704',
        hasDefaultChatName: false,
        chatName: 'Los Angeles - American 21',
      },
      {
        id: 'c1e6c24a-036b-43cd-aa53-bf32ee4ac43e',
        tableId: '4f6a1d90-17e0-4e97-b3a0-70aeed1b1d48',
        hasDefaultChatName: false,
        chatName: 'San Diego - American 21',
      },
      {
        id: 'c1e6c24a-036b-43cd-aa53-bf32ee4ac777',
        tableId: 'be11a610-7777-7777-7777-7be11a610777',
        hasDefaultChatName: false,
        chatName: 'Bellagio',
      },
      {
        id: 'c1e6c24a-036b-43cd-aa53-bf32ee4ac77e',
        tableId: null,
        hasDefaultChatName: false,
        chatName: 'Best Buds',
      },


    ],{});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Conversations', null, {});
  },
};
