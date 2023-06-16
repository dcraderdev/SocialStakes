'use strict';
const uuid = require('uuid');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}


module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create pots
    const pot1 = {
      id: 'e87a6a96-6ebc-4ef3-b6a1-3058b1000001',
      roundId: 1,
      potAmount: 50,
    };
    const pot2 = {
      id: 'e87a6a96-6ebc-4ef3-b6a1-3058b1000002',
      roundId: 1,
      potAmount: 50,
    };
    const pot3 = {
      id: 'e87a6a96-6ebc-4ef3-b6a1-3058b1000003',
      roundId: 2,
      potAmount: 50,
    };
    const pot4 = {
      id: 'e87a6a96-6ebc-4ef3-b6a1-3058b1000004',
      roundId: 2,
      potAmount: 50,
    };

    await queryInterface.bulkInsert('Pots', [pot1, pot2, pot3, pot4], {});

    // Create UserPots
    const userPot1 = {
      id: 'e87a6a96-6ebc-4ef3-b6a1-3058b7770004',
      userId: 'b16f9b4c-9d72-4e21-81ea-8fcf6a7987d7',
      potId: pot1.id,
      won: true
    };
    const userPot2 = {
      id: 'e87a6a96-6ebc-4ef3-b6a1-3058b7770005',
      userId: '2da2c0a2-0de9-4275-a5e5-5d91e8b8533c',
      potId: pot2.id,
      won: false
    };
    const userPot3 = {
      id: 'e87a6a96-6ebc-4ef3-b6a1-3058b7770006',
      userId: 'b16f9b4c-9d72-4e21-81ea-8fcf6a7987d7',
      potId: pot3.id,
    };
    const userPot4 = {
      id: 'e87a6a96-6ebc-4ef3-b6a1-3058b7770007',
      userId: '2da2c0a2-0de9-4275-a5e5-5d91e8b8533c',
      potId: pot4.id,
    };

    await queryInterface.bulkInsert('UserPots', [userPot1, userPot2, userPot3, userPot4], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('UserPots', null, {});
    await queryInterface.bulkDelete('Pots', null, {});
  }
};
