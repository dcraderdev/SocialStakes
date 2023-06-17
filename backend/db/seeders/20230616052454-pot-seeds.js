'use strict';
const uuid = require('uuid');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}


module.exports = {
  up: async (queryInterface, Sequelize) => {

    options.tableName = 'Pots';

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

    await queryInterface.bulkInsert(options, [pot1, pot2], {});


    options.tableName = 'UserPots';

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


    await queryInterface.bulkInsert(options, [userPot1, userPot2], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'UserPots';
    await queryInterface.bulkDelete('UserPots', null, {});
    options.tableName = 'Pots';
    await queryInterface.bulkDelete('Pots', null, {});
  }
};
