'use strict';
const uuid = require('uuid');
const {  
  generateSeed,
  generateDeck,
  shuffle,
  fetchLatestBlock,
  fetchSpecificBlockHash,
  getLatestBlockHeight,
  generateFloats,
  byteGenerator,
  drawCards
} = require('../../controllers/cardController')

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}


module.exports = {
  up: async (queryInterface, Sequelize) => {



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


    let userIds = [
      'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b', // Trina Pine
      '87d1cb3a-b8e2-4c7e-9d80-462a523b0fcb', // Hazel Foreste
    ]

    let serverSeed1 = serverSeeds[0].serverSeed
    let serverSeed2 = serverSeeds[1]
    let blockHash = blockHashSeeds[0]
    let nonce = '1'



    let deck1 = generateDeck(serverSeed1, blockHash, nonce)

    console.log(deck1);


    let cards1 = await drawCards(deck1, 2, serverSeed1, blockHash, nonce)
    let cards2 = await drawCards(deck1, 2, serverSeed1, blockHash, nonce)
    let cards3 = await drawCards(deck1, 2, serverSeed1, blockHash, nonce)

    console.log(cards1);
    console.log(cards2);
    console.log(cards3);
    console.log(deck1);

    console.log(`---> ${cards1[0]} ${cards1[1]}`);

    let actionEntries = [
      // betting phase
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058aaaaaa01',
        userId: userIds[0], // Trina Pine
        roundId: 2,
        type: 'bet_init',
        card: null,
        betSize: 50,
      }, 
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058aaaaaa02',
        userId: userIds[1], // Hazel Forest
        roundId: 2,
        type: 'bet_init',
        card: null,
        betSize: 50,
      }, 
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058aaaaaa03',
        userId: userIds[0], // Trina Pine
        roundId: 2,
        type: 'initial_cards_deal',
        card: `${cards1[0]} ${cards1[1]}`,
        betSize: null,
      },

      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058aaaaaa04',
        userId: userIds[1], // Hazel Forest
        roundId: 2,
        type: 'initial_cards_deal',
        card: `${cards2[0]} ${cards2[1]}`,
        betSize: null,
      },


    ];

    await queryInterface.bulkInsert('Actions', actionEntries, {});


   let handEntries = [
     {
       id: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fffc',
       userTableId: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fbba', // Trina Pine
       roundId: 2,
       cards: `${cards1[0]} ${cards1[1]}`
     },
     {
       id: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fffd',
       userTableId: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fbbb', // Hazel Forest
       roundId: 2,
       cards: `${cards2[0]} ${cards2[1]}`
     },
   ]


    await queryInterface.bulkInsert('Hands', handEntries, {});


  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Actions';
    return queryInterface.bulkDelete(options, {});
  },
};
