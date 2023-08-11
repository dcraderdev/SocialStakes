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
        url: '',
        name: 'None',
      },
      {
        url: 'image_adobe_express (2) (1).jpeg',
        name: 'Midnight Black',
      },
      {
        url: 'Social Stakes (4).jpg',
        name: 'Spring Green',
      },
      {
        url: 'Social Stakes (1).jpg',
        name: 'Fairway Green',
      },
      {
        url: 'image_adobe_express (1) (1).jpeg',
        name: 'Royal Ruby',
      },
      {
        url: 'felt-green4 (1).jpeg',
        name: 'Authentic',
      },

      

    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Themes';
    return queryInterface.bulkDelete(options, {});
  }
};
