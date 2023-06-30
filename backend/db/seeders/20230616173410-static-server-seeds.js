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

    const tableIds = ['e10d8de4-f4c2-4d28-9324-56aa9c920801'];
    const gameSessions = [];

    let blockHashSeeds = [ '9b933ea9aa2ab2124be2caaa0fb91e8fb11f5a1789eb228887d0be9cdf2e7d8b' ]  

      const blockHash = blockHashSeeds[0]
      gameSessions.push({
        id: uuid.v4(),
        tableId: tableIds[0],
        // serverSeedId: serverSeeds[i].id,
        blockHash,
        nonce: '1', 
      });

    await queryInterface.bulkInsert(options, gameSessions);


    options.tableName = 'ServerSeeds';
    let serverSeeds = [
      {
        id:'b16f9b4c-0000-0000-0000-8fcf6a000111', 
        serverSeed:'d639e1c006361c8af99f64c8578325336d346caf5011c32a47111246a31ceba8',
        gameSessionId:gameSessions[0].id,
        used: false
      },
      ]


    return queryInterface.bulkInsert(options, serverSeeds);


  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'GameSessions';
    await queryInterface.bulkDelete(options, null, {});
    options.tableName = 'ServerSeeds';
    return queryInterface.bulkDelete(options, null, {});
  }
};
