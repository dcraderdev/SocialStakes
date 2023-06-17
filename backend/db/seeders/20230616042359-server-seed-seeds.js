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
    options.tableName = 'serverSeeds';

    function generateSeed() {
      const randomValue = crypto.randomBytes(64).toString('hex');
      const serverSeed = crypto.createHash('sha256').update(randomValue).digest('hex');
      
      return {
        id: uuid.v4(),
        serverSeed
      };
    }

    const allEntries = Array.from({ length: 10 }, generateSeed);

    await queryInterface.bulkInsert(options.tableName, allEntries);

    options.tableName = 'GameSessions';

    async function fetchLatestBlock() {
      const url = 'https://blockchain.info/latestblock';
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data.hash;
      } catch (error) {
        console.error('Error:', error);
      }
    }

    const tableIds = ['e10d8de4-f4c2-4d28-9324-56aa9c920801'];
    const gameSessions = [];

    for (let i = 0; i < 2; i++) {
      const blockHash = await fetchLatestBlock();
      gameSessions.push({
        id: uuid.v4(),
        tableId: tableIds[0],
        serverSeed: allEntries[i].id,
        blockHash,
        nonce: '1', 
        clientSeed: null,
      });
    }

    return queryInterface.bulkInsert(options.tableName, gameSessions);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('GameSessions', null, {});
    return queryInterface.bulkDelete('serverSeeds', null, {});
  }
};
