'use strict';
const uuid = require('uuid');
const crypto = require('crypto');
const fetch = require('node-fetch');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  
}

module.exports = { 
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'GameSessions';

    // const tableIds = ['e10d8de4-f4c2-4d28-9324-56aa9c920801'];

    const tableIds = [
      'e10d8de4-f4c2-4d28-9324-56aa9c920801',
      '62a1650f-7e96-4e36-a89f-6de17e145be1',
      'f14c6d8a-347c-4e6a-ae9b-0a8b708fb4a7',
      'a1e6c3f7-2f4d-41f1-89a4-1e672e1f4857',
      'ee828376-6f33-4d2c-b5c0-07c6b8762e2f',
      'bda7360c-10a2-4ee9-a4d2-3e41f688d641',
      '0bdeed9a-6ce4-4a06-8470-3ddfc0fcdf2b',
      'b2866e5a-bb89-47ea-b30b-6d1a677f0704',
      '4f6a1d90-17e0-4e97-b3a0-70aeed1b1d48'
    ];

    const blockHashSeeds = [
      '9b933ea9aa2ab2124be2caaa0fb91e8fb11f5a1789eb228887d0be9cdf2e7d8b',
    ];

    const serverSeedKeys = [
      '9b933ea9aa2ab2124be2caaa0fb91e8fb11f5a1789eb228887d0be9cdf2e7d8b',
      'fde2b3e0c8755a1b8944e1c45629087cbe7d014a7aa0d6713f4b285c6af4e8b9',
      '9b933ea9aa2ab2124be2caaa0fb91e8fb11f5a1789eb228887d0be9cdf2e7d8c',
      'fde2b3e0c8755a1b8944e1c45629087cbe7d014a7aa0d6713f4b285c6af4e8bd',
      '9b933ea9aa2ab2124be2caaa0fb91e8fb11f5a1789eb228887d0be9cdf2e7d8e',
      'fde2b3e0c8755a1b8944e1c45629087cbe7d014a7aa0d6713f4b285c6af4e8bf',
      '9b933ea9aa2ab2124be2caaa0fb91e8fb11f5a1789eb228887d0be9cdf2e7d8g',
      'fde2b3e0c8755a1b8944e1c45629087cbe7d014a7aa0d6713f4b285c6af4e8bh',
      '9b933ea9aa2ab2124be2caaa0fb91e8fb11f5a1789eb228887d0be9cdf2e7d8i'
    ];


    
    const gameSessions = [];

    const blockHash = blockHashSeeds[0]

    for(let i = 0; i < tableIds.length; i++){

      gameSessions.push({
        id: uuid.v4(),
        tableId: tableIds[i],
        // serverSeedId: serverSeeds[i].id,
        blockHash,
        nonce: '1', 
      });

    }


    await queryInterface.bulkInsert(options, gameSessions);


    options.tableName = 'ServerSeeds';

    let serverSeeds = []

    for(let i = 0; i < tableIds.length; i++){
      serverSeeds.push(
        {
          id: uuid.v4(), 
          serverSeed:serverSeedKeys[i],
          gameSessionId:gameSessions[i].id,
          used: false
        }
      )
    }
      


    return queryInterface.bulkInsert(options, serverSeeds);


  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'GameSessions';
    await queryInterface.bulkDelete(options, null, {});
    options.tableName = 'ServerSeeds';
    return queryInterface.bulkDelete(options, null, {});
  }
};
