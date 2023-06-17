'use strict';
const uuid = require('uuid');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Actions';

    let actionEntries = [
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058b1322a01',
        userId: 'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b', // Trina Pine
        roundId: 1,
        type: 'bet_init',
        card: null,
        betSize: 50,
      },
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058b1322a02',
        userId: '87d1cb3a-b8e2-4c7e-9d80-462a523b0fcb', // Hazel Forest
        roundId: 1,
        type: 'bet_init',
        card: null,
        betSize: 50,
      },
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058b1322a03',
        userId: 'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b', // Trina Pine
        roundId: 1,
        type: 'initial_cards_deal',
        card: '2h 14s',
        betSize: null,
      },
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058b1322a04',
        userId: '87d1cb3a-b8e2-4c7e-9d80-462a523b0fcb', // Hazel Forest
        roundId: 1,
        type: 'initial_cards_deal',
        card: '2d 13s',
        betSize: null,
      },
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058b1322a05',
        userId: null, // Dealer (init)
        roundId: 1,
        type: 'initial_cards_deal',
        card: '10c',
        betSize: null,
      },
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058b1322a06',
        userId: 'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b', // Trina Pine
        roundId: 1,
        type: 'stay_player',
        card: null,
        betSize: null,
      },
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058b1322a07',
        userId: '87d1cb3a-b8e2-4c7e-9d80-462a523b0fcb', // Hazel Forest
        roundId: 1,
        type: 'hit_dealer_deal',
        card: '7c',
        betSize: null,
      },
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058b1322a08',
        userId: '87d1cb3a-b8e2-4c7e-9d80-462a523b0fcb', // Hazel Forest
        roundId: 1,
        type: 'bust',
        card: null,
        betSize: null,
      },
      {
        id: 'ea0a6a96-7abc-4ef-b6a1-3058b1322a09',
        userId: null, // Dealer (init)
        roundId: 1,
        type: 'initial_cards_deal',
        card: '5h',
        betSize: null,
      },
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058b1322a10',
        userId: null, // Dealer (round)
        roundId: 1,
        type: 'hit_dealer_deal',
        card: '7s',
        betSize: null,
      },
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058b1322a11',
        userId: null, // Dealer (round)
        roundId: 1,
        type: 'bust',
        card: null,
        betSize: null,
      },
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058b1322a12',
        userId: 'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b', // Trina Pine
        roundId: 1,
        type: 'win',
        card: null,
        betSize: null,
      },
    ];

    await queryInterface.bulkInsert(options, actionEntries, {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Actions';
    return queryInterface.bulkDelete(options, {});
  },
};
