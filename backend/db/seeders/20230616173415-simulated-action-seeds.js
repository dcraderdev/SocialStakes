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

   // Simulate Round


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
    let cards4 = await drawCards(deck1, 1, serverSeed1, blockHash, nonce)
    let cards5 = await drawCards(deck1, 1, serverSeed1, blockHash, nonce)

    console.log(cards1);
    console.log(cards2);
    console.log(cards3);
    console.log(cards4);
    console.log(cards5);




    console.log(deck1);

    console.log(`---> ${cards1[0]} ${cards1[1]}`);



    // Create Rounds
    // Since we know the outcome we will put it dealer's cards now
    options.tableName = 'Rounds';
    let roundEntries = [
      {
        tableId: 'e10d8de4-f4c2-4d28-9324-56aa9c920801',
        active: false,
        cards: `${cards3[1]}${cards4[0]}${cards5[0]}`,
        phase: 'game_decided',
      }
    ]

    await queryInterface.bulkInsert(options, roundEntries, {});





   // Create Actions
   options.tableName = 'Actions'


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
      // {
      //   id: 'ea0a6a96-7abc-4ef3-b6a1-3058aaaaaa02',
      //   userId: userIds[1], // Hazel Forest
      //   roundId: 2,
      //   type: 'bet_init',
      //   card: null,
      //   betSize: 50,
      // }, 
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058aaaaaa03',
        userId: userIds[0], // Trina Pine
        roundId: 2,
        type: 'initial_cards_deal',
        card: `${cards1[0]} ${cards1[1]}`, //[ 29, 51 ]{ rank: '5', suit: 'diamond', value: 5 }{ rank: 'A', suit: 'club', value: 11 }

        betSize: null,
      },
      // {
      //   id: 'ea0a6a96-7abc-4ef3-b6a1-3058aaaaaa04',
      //   userId: userIds[1], // Hazel Forest
      //   roundId: 2,
      //   type: 'initial_cards_deal',
      //   card: `${cards2[0]} ${cards2[1]}`, //[ 21, 32 ]{ rank: '10', suit: 'heart', value: 10 }{ rank: '8', suit: 'diamond', value: 8 }
      //   betSize: null,
      // },

      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058aaaaaa05',
        userId: null, // Dealer (init)
        roundId: 2,
        type: 'initial_cards_deal', // [ 2 ]{ rank: '4', suit: 'spade', value: 4 }
        card: `${cards3[0]}`,
        betSize: null,
      },
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058aaaaaa06',
        userId: 'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b', // Trina Pine
        roundId: 2,
        type: 'stay_player',
        card: null,
        betSize: null,
      },
      // {
      //   id: 'ea0a6a96-7abc-4ef3-b6a1-3058aaaaaa07',
      //   userId: '87d1cb3a-b8e2-4c7e-9d80-462a523b0fcb', // Hazel Forest
      //   roundId: 2,
      //   type: 'stay_player',
      //   card: null,
      //   betSize: null,
      // },
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058aaaaaa08',
        userId: null, // Dealer (init)
        roundId: 2,
        type: 'initial_cards_deal',
        card: `${cards3[1]}`,// [ 46 ]{ rank: '9', suit: 'club', value: 9 }
        betSize: null,
      },

      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058aaaaaa09',
        userId: null, // Dealer (round)
        roundId: 2,
        type: 'hit_dealer_deal',
        card: `${cards4[0]}`,// [ 13 ] { rank: '2', suit: 'heart', value: 2 }
        betSize: null,
      },
      {
        id: 'ea0a6a96-7abc-4ef3-b6a1-3058aaaaaa10',
        userId: null, // Dealer (round)
        roundId: 2,
        type: 'hit_dealer_deal',
        card: `${cards5[0]}`,// [ 22 ] { rank: 'J', suit: 'heart', value: 10 }
        betSize: null,
      },



    ];
    await queryInterface.bulkInsert(options, actionEntries, {});
  //  // Create Hands

  options.tableName = 'Hands'

   let handEntries = [
     {
       id: 'ea0a6a96-7abc-4ef3-b6a1-5555aaaabb10',
       userTableId: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fbba', // Trina Pine
       roundId: 2,
       cards: `${cards1[0]} ${cards1[1]}`
     },
    //  {
    //    id: 'ea0a6a96-7abc-4ef3-b6a1-5556aaaabb11',
    //    userTableId: 'e87a6a96-6ebc-4ef3-b6a1-3058b136fbbb', // Hazel Forest
    //    roundId: 2,
    //    cards: `${cards2[0]} ${cards2[1]}`
    //  },
   ]


    await queryInterface.bulkInsert(options, handEntries, {});



   // Create Pots
   options.tableName = 'Pots'

    const pot1 = {
      id: 'e87a6a96-6ebc-4ef3-b6a1-3058b1000014',
      roundId: 2,
      potAmount: 50,
    };

    // const pot2 = {
    //   id: 'e87a6a96-6ebc-4ef3-b6a1-3058b1000015',
    //   roundId: 2,
    //   potAmount: 50,
    // };

    await queryInterface.bulkInsert(options, [pot1], {});

    // Create UserPots
   options.tableName = 'UserPots'

    const userPot1 = {
      id: 'e87a6a96-6ebc-4ef3-b6a1-3058b7770014',
      userId: 'b16f9b4c-9d72-4e21-81ea-8fcf6a7987d7',
      potId: pot1.id,
      won: false
    };
    // const userPot2 = {
    //   id: 'e87a6a96-6ebc-4ef3-b6a1-3058b7770015',
    //   userId: '2da2c0a2-0de9-4275-a5e5-5d91e8b8533c',
    //   potId: pot2.id,
    //   won: false
    // };

    await queryInterface.bulkInsert(options, [userPot1], {});


  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Pots';
    await queryInterface.bulkDelete(options, {});
    options.tableName = 'UserPots';
    await queryInterface.bulkDelete(options, {});
    options.tableName = 'Hands';
    await queryInterface.bulkDelete(options, {});
    options.tableName = 'Actions';
    await queryInterface.bulkDelete(options, {});

  },
};
