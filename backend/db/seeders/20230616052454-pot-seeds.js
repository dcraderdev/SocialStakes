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
      id: uuid.v4(),
      roundId: 1,
      potAmount: 50,
    };
    const pot2 = {
      id: uuid.v4(),
      roundId: 1,
      potAmount: 50,
    };
    const pot3 = {
      id: uuid.v4(),
      roundId: 2,
      potAmount: 50,
    };
    const pot4 = {
      id: uuid.v4(),
      roundId: 2,
      potAmount: 50,
    };

    await queryInterface.bulkInsert('Pots', [pot1, pot2, pot3, pot4], {});

    // Create UserPots
    const userPot1 = {
      id: uuid.v4(),
      userId: 'b16f9b4c-9d72-4e21-81ea-8fcf6a7987d7',
      potId: pot1.id,
    };
    const userPot2 = {
      id: uuid.v4(),
      userId: '2da2c0a2-0de9-4275-a5e5-5d91e8b8533c',
      potId: pot2.id,
    };
    const userPot3 = {
      id: uuid.v4(),
      userId: 'b16f9b4c-9d72-4e21-81ea-8fcf6a7987d7',
      potId: pot3.id,
    };
    const userPot4 = {
      id: uuid.v4(),
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
