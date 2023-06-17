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
    options.tableName = 'ServerSeeds';


    let serverSeeds = [
      {
        id:'b16f9b4c-0000-0000-0000-8fcf6a000111', 
        serverSeed:'d639e1c006361c8af99f64c8578325336d346caf5011c32a47111246a31ceba8',
      },
      {
        id:'b16f9b4c-0000-0000-0000-8fcf6a000112', 
        serverSeed:'3630cf9f5384c671a06d6760a95940cef2f9f36e98b3f7b1660cb326c58cfd1d'
      }
      ]

    let blockHashSeeds = [
      '9b933ea9aa2ab2124be2caaa0fb91e8fb11f5a1789eb228887d0be9cdf2e7d8b'
    ]  

    await queryInterface.bulkInsert(options.tableName, serverSeeds);


    options.tableName = 'GameSessions';



    const tableIds = ['e10d8de4-f4c2-4d28-9324-56aa9c920801'];
    const gameSessions = [];

    for (let i = 0; i < 2; i++) {
      const blockHash = blockHashSeeds[0]
      gameSessions.push({
        id: uuid.v4(),
        tableId: tableIds[0],
        serverSeedId: serverSeeds[i].id,
        blockHash,
        nonce: '1', 
      });
    }

    return queryInterface.bulkInsert(options.tableName, gameSessions);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('GameSessions', null, {});
    return queryInterface.bulkDelete('ServerSeeds', null, {});
  }
};
