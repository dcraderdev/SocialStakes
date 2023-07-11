'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Tables';
    return queryInterface.bulkInsert(
      options,
      [
        {
          id: 'e10d8de4-f4c2-4d28-9324-56aa9c920801',
          gameId: 'blackjack_1_deck_low_stakes_multi',
          shufflePoint: 25,
          tableName: 'American 21',
          tableBalance: 0,
        },
        {
          id: '62a1650f-7e96-4e36-a89f-6de17e145be1',
          gameId: 'blackjack_4_deck_low_stakes_multi',
          shufflePoint: 136,
          tableName: 'American 21',
          tableBalance: 0,
        },
        {
          id: 'f14c6d8a-347c-4e6a-ae9b-0a8b708fb4a7',
          gameId: 'blackjack_6_deck_low_stakes_multi',
          shufflePoint: 180,
          tableName: 'American 21',
          tableBalance: 0,
        },
        {
          id: 'a1e6c3f7-2f4d-41f1-89a4-1e672e1f4857',
          gameId: 'blackjack_1_deck_mid_stakes_multi',
          shufflePoint: 25,
          tableName: 'American 21',
          tableBalance: 0,
        },
        {
          id: 'ee828376-6f33-4d2c-b5c0-07c6b8762e2f',
          gameId: 'blackjack_4_deck_mid_stakes_multi',
          shufflePoint: 136,
          tableName: 'American 21',
          tableBalance: 0,
        },
        {
          id: 'bda7360c-10a2-4ee9-a4d2-3e41f688d641',
          gameId: 'blackjack_6_deck_mid_stakes_multi',
          shufflePoint: 180,
          tableName: 'American 21',
          tableBalance: 0,
        },
        {
          id: '0bdeed9a-6ce4-4a06-8470-3ddfc0fcdf2b',
          gameId: 'blackjack_1_deck_high_stakes_multi',
          shufflePoint: 25,
          tableName: 'American 21',
          tableBalance: 0,
        },
        {
          id: 'b2866e5a-bb89-47ea-b30b-6d1a677f0704',
          gameId: 'blackjack_4_deck_high_stakes_multi',
          shufflePoint: 136,
          tableName: 'American 21',
          tableBalance: 0,
        },
        {
          id: '4f6a1d90-17e0-4e97-b3a0-70aeed1b1d48',
          gameId: 'blackjack_6_deck_high_stakes_multi',
          shufflePoint: 180,
          tableName: 'American 21',
          tableBalance: 0,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Tables';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {});
  },
};
