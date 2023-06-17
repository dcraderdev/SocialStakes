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
} = require('./cardController')

let cardConverter = {
  0: {
    rank: '2',
    suit: 'spade',
    value: 2,
  },
  1: {
    rank: '3',
    suit: 'spade',
    value: 3,
  },
  2: {
    rank: '4',
    suit: 'spade',
    value: 4,
  },
  3: {
    rank: '5',
    suit: 'spade',
    value: 5,
  },
  4: {
    rank: '6',
    suit: 'spade',
    value: 6,
  },
  5: {
    rank: '7',
    suit: 'spade',
    value: 7,
  },
  6: {
    rank: '8',
    suit: 'spade',
    value: 8,
  },
  7: {
    rank: '9',
    suit: 'spade',
    value: 9,
  },
  8: {
    rank: '10',
    suit: 'spade',
    value: 10,
  },
  9: {
    rank: 'J',
    suit: 'spade',
    value: 10,
  },
  10: {
    rank: 'Q',
    suit: 'spade',
    value: 10,
  },
  11: {
    rank: 'K',
    suit: 'spade',
    value: 10,
  },
  12: {
    rank: 'A',
    suit: 'spade',
    value: 11,
  },
  13: {
    rank: '2',
    suit: 'heart',
    value: 2,
  },
  14: {
    rank: '3',
    suit: 'heart',
    value: 3,
  },
  15: {
    rank: '4',
    suit: 'heart',
    value: 4,
  },
  16: {
    rank: '5',
    suit: 'heart',
    value: 5,
  },
  17: {
    rank: '6',
    suit: 'heart',
    value: 6,
  },
  18: {
    rank: '7',
    suit: 'heart',
    value: 7,
  },
  19: {
    rank: '8',
    suit: 'heart',
    value: 8,
  },
  20: {
    rank: '9',
    suit: 'heart',
    value: 9,
  },
  21: {
    rank: '10',
    suit: 'heart',
    value: 10,
  },
  22: {
    rank: 'J',
    suit: 'heart',
    value: 10,
  },
  23: {
    rank: 'Q',
    suit: 'heart',
    value: 10,
  },
  24: {
    rank: 'K',
    suit: 'heart',
    value: 10,
  },
  25: {
    rank: 'A',
    suit: 'heart',
    value: 11,
  },
  26: {
    rank: '2',
    suit: 'diamond',
    value: 2,
  },
  27: {
    rank: '3',
    suit: 'diamond',
    value: 3,
  },
  28: {
    rank: '4',
    suit: 'diamond',
    value: 4,
  },
  29: {
    rank: '5',
    suit: 'diamond',
    value: 5,
  },
  30: {
    rank: '6',
    suit: 'diamond',
    value: 6,
  },
  31: {
    rank: '7',
    suit: 'diamond',
    value: 7,
  },
  32: {
    rank: '8',
    suit: 'diamond',
    value: 8,
  },
  33: {
    rank: '9',
    suit: 'diamond',
    value: 9,
  },
  34: {
    rank: '10',
    suit: 'diamond',
    value: 10,
  },
  35: {
    rank: 'J',
    suit: 'diamond',
    value: 10,
  },
  36: {
    rank: 'Q',
    suit: 'diamond',
    value: 10,
  },
  37: {
    rank: 'K',
    suit: 'diamond',
    value: 10,
  },
  38: {
    rank: 'A',
    suit: 'diamond',
    value: 11,
  },
  39: {
    rank: '2',
    suit: 'club',
    value: 2,
  },
  40: {
    rank: '3',
    suit: 'club',
    value: 3,
  },
  41: {
    rank: '4',
    suit: 'club',
    value: 4,
  },
  42: {
    rank: '5',
    suit: 'club',
    value: 5,
  },
  43: {
    rank: '6',
    suit: 'club',
    value: 6,
  },
  44: {
    rank: '7',
    suit: 'club',
    value: 7,
  },
  45: {
    rank: '8',
    suit: 'club',
    value: 8,
  },
  46: {
    rank: '9',
    suit: 'club',
    value: 9,
  },
  47: {
    rank: '10',
    suit: 'club',
    value: 10,
  },
  48: {
    rank: 'J',
    suit: 'club',
    value: 10,
  },
  49: {
    rank: 'Q',
    suit: 'club',
    value: 10,
  },
  50: {
    rank: 'K',
    suit: 'club',
    value: 10,
  },
  51: {
    rank: 'A',
    suit: 'club',
    value: 11,
  },
};



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


let cards1 =  drawCards(deck1, 2, serverSeed1, blockHash, nonce)
let cards2 =  drawCards(deck1, 2, serverSeed1, blockHash, nonce)
let cards3 =  drawCards(deck1, 2, serverSeed1, blockHash, nonce)
let cards4 =  drawCards(deck1, 1, serverSeed1, blockHash, nonce)
let cards5 =  drawCards(deck1, 1, serverSeed1, blockHash, nonce)

console.log(cards1);
console.log(cards2);
console.log(cards3);
console.log(cards4);
console.log(cards5);
console.log(deck1);



console.log(cardConverter[2]);
console.log(cardConverter[22]);
