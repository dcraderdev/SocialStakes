'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  
}

module.exports = { 
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Themes';
    return queryInterface.bulkInsert(options, [
      {
        url: 'image_adobe_express (2) (1).jpeg',
        name: 'black',
      },
      {
        url: 'Social Stakes (4).jpg',
        name: 'darkgreen',
      },
      {
        url: 'Social Stakes (1).jpg',
        name: 'lightgreen',
      },
      {
        url: 'image_adobe_express (1) (1).jpeg',
        name: 'red',
      },
      {
        url: 'felt-green4 (1).jpeg',
        name: 'realfelt',
      },

      

    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Themes';
    return queryInterface.bulkDelete(options, {});
  }
};
