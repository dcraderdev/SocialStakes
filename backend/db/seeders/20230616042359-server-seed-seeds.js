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

    function generateSeed() {
      const randomValue = crypto.randomBytes(64).toString('hex');
      const serverSeed = crypto.createHash('sha256').update(randomValue).digest('hex');
      
      return {
        id: uuid.v4(),
        serverSeed
      };
    }

    const allEntries = Array.from({ length: 10 }, generateSeed);

    await queryInterface.bulkInsert(options, allEntries, {});

  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'ServerSeeds';
    return queryInterface.bulkDelete(options, {});
  }
};


