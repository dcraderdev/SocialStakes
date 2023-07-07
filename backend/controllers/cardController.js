const fetch = require('node-fetch');
const crypto = require('crypto');
const _ = require('lodash');

const {cardConverter} = require('./cardConverter');



function generateSeed() {
  // generate a random value
  const randomValue = crypto.randomBytes(64).toString('hex');
  // hash the random value to generate the seed
  const serverSeed = crypto.createHash('sha256').update(randomValue).digest('hex');
  return serverSeed;
}



// function generateDeck(serverSeed, blockHash, nonce) {
//   const hash = crypto.createHash('sha256');
//   hash.update(serverSeed + blockHash + nonce);
//   const seed = parseInt(hash.digest('hex').substr(0, 10), 16);
//   const deck = shuffle([...Array(52).keys()], seed); // Shuffle an array of 52 numbers
//   return deck;
// }

function generateDeck(serverSeed, blockHash, nonce, decksUsed) {
  let arrLength = decksUsed * 52
  const hash = crypto.createHash('sha256');
  hash.update(serverSeed + blockHash + nonce);
  const seed = parseInt(hash.digest('hex').substr(0, 10), 16);
  const deck = shuffle([...Array(arrLength).keys()], seed); // Shuffle an array of __ numbers
  return deck;
}



function verifyDeck(serverSeed, blockHash, nonce, deck) {
  const calculatedDeck = generateDeck(serverSeed, blockHash, nonce);
  return JSON.stringify(calculatedDeck) === JSON.stringify(deck);
}


function shuffle(array, seed) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  seed = seed || 1;
  let random = function() {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
  };

  while (0 !== currentIndex) {
      randomIndex = Math.floor(random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
  }

  return array;
}


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
async function fetchSpecificBlockHash(blockHeight) {
  const url = `https://blockchain.info/block-height/${blockHeight}?format=json`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data.blocks[0].hash);
  } catch (error) {
    console.error('Error:', error);
  }
}

// script to keep checking for a new block
async function getLatestBlockHeight() {
  const response = await fetch('https://blockchain.info/latestblock');
  const data = await response.json();
  return data.height;
}

// check every 10 minutes for predetermined block number
async function waitForBlock(blockHeight) {
  let latestBlockHeight = await getLatestBlockHeight();
  
  while(latestBlockHeight < blockHeight) {
    console.log(`Block ${blockHeight} has not been mined yet. Waiting...`);
    await new Promise(resolve => setTimeout(resolve, 600000));  // wait for 10 minutes
    latestBlockHeight = await getLatestBlockHeight();
  }
  
  console.log(`Block ${blockHeight} has been mined.`);
}
// waitForBlock(794500);  // substitute # with the block you are waiting for





async function generateAndVerifyDeck(clientSeed, serverSeed, nonce) {

  console.log('Client Seed (Block Hash):', clientSeed);

  let generatedDeck = generateDeck(serverSeed, clientSeed, nonce);
  // console.log('Generated Deck:', generatedDeck); 

  let isVerified = verifyDeck(serverSeed, clientSeed, nonce, generatedDeck);
  console.log('Is Deck Verified?', isVerified);  // This should print 'true' if the deck is verified.

  return generatedDeck
}


function generateFloats({
  serverSeed,
  clientSeed,
  nonce,
  cursor,
  count,
}) {
  const rng = byteGenerator({
    serverSeed,
    clientSeed,
    nonce,
    cursor,
  });
  const bytes = [];

  while (bytes.length < count * 4) {
    bytes.push(rng.next().value);
  }

  return _.chunk(bytes, 4).map(bytesChunk =>
    bytesChunk.reduce((result, value, i) => {
      const divider = 256 ** (i + 1);
      const partialResult = value / divider;
      return result + partialResult;
    }, 0),
  );
}
  

function* byteGenerator({ serverSeed, blockHash, nonce, cursor }) {
  let currentRound = Math.floor(cursor / 32);
  let currentRoundCursor = cursor;
  currentRoundCursor -= currentRound * 32;

  while (true) {
    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(`${blockHash}:${nonce}:${currentRound}`);
    const buffer = hmac.digest();

    while (currentRoundCursor < 32) {
      yield Number(buffer[currentRoundCursor]);
      currentRoundCursor += 1;
    }
    currentRoundCursor = 0;
    currentRound += 1;
  }
}


let clientSeeds = [] 
let serverSeeds = [] 

// let clientSeed = generateSeed()
// let serverSeed = await fetchLatestBlock();
// let nonce = "1";

// clientSeeds.push(clientSeed)
// serverSeeds.push(serverSeed)
// let generatedDeck = generateAndVerifyDeck(clientSeed, serverSeed);

// let totalNumberOfDraws = 2


// const draws = generateFloats({
//   serverSeed: serverSeed,
//   clientSeed: clientSeed,
//   nonce: nonce,
//   cursor: 0,
//   count: totalNumberOfDraws,  // the total number of cards you plan to draw
// }).map(float => Math.floor(float * 52));




async function main() {
  let serverSeed = generateSeed();
  let blockHash = await fetchLatestBlock();
  let nonce = "1";

  clientSeeds.push(clientSeed);
  serverSeeds.push(serverSeed);

  let deck = await generateAndVerifyDeck(blockHash, serverSeed, nonce);
  let totalNumberOfDraws = 2;

  const draws = generateFloats({
    serverSeed: serverSeed,
    clientSeed: blockHash,
    nonce: nonce,
    cursor: 0,
    count: totalNumberOfDraws,
  }).map(float => Math.floor(float * 52));


  console.log(deck);
  // Draw the cards
  const cardsDrawn = draws.map(draw => deck[draw]);

  // Remove the drawn cards from the deck
  cardsDrawn.forEach(draw => {
    const index = deck.indexOf(draw);
    if (index > -1) {
      deck.splice(index, 1);6
    }
  });

  return cardsDrawn;
}

// let draws = main().catch(console.error).then(()=>console.log(draws));
// // console.log(draws);

// main().then(draws => {
//   console.log(draws);
// }).catch(console.error);


// async function drawCards(deck, totalNumberOfDraws, serverSeed, blockHash, nonce) {

//   let localDeck = [...deck];
//   const cardsDrawn = [];

//   for(let i=0; i<totalNumberOfDraws; i++) {
//     const drawFloat = generateFloats({
//       serverSeed: serverSeed,
//       blockHash: blockHash,
//       nonce: nonce,
//       cursor: i,
//     });

//     // Get card index based on current deck size
//     const drawIndex = Math.floor(drawFloat * localDeck.length);
    
//     // Add drawn card to drawn array and remove it from the deck
//     cardsDrawn.push(localDeck[drawIndex]);
//     localDeck.splice(drawIndex, 1);
//   }

//   return cardsDrawn;
// }


// async function drawCards(deck, totalNumberOfDraws, serverSeed, blockHash, nonce, cursor) {
//   const draws = generateFloats({
//     serverSeed: serverSeed,
//     blockHash: blockHash,
//     nonce: nonce,
//     cursor: cursor,
//     count: totalNumberOfDraws,
//   }).map(float => Math.floor(float * deck.length)); // Use the current deck length

//   const cardsDrawn = [];

//   // Sort the draw indexes in descending order. This way, removing cards from the deck doesn't shift
//   // the positions of the cards we haven't drawn yet.
//   draws.sort((a, b) => b - a);

//   // Draw the cards and remove them from the deck
//   draws.forEach(draw => {
//     cardsDrawn.push(deck[draw]);
//     deck.splice(draw, 1);
//   });

//   return cardsDrawn;
// }

function drawCards(drawObj) {
  const {deck, cardsToDraw, cursor} = drawObj

  console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
 
console.log(deck);
console.log(cardsToDraw);
console.log(cursor);
console.log('-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=');

  const drawnCards = deck.splice(0, cardsToDraw);

  console.log(deck);
  let newDeck = deck
  let drawnCardsAndDeck = {drawnCards, newDeck}

console.log(drawnCards);
  return drawnCardsAndDeck;
}



  async function handSummary(cards) {
    console.log('HAND SUMMARY');

    let handSummary = {
      blackjack: false,
      softSeventeen: false,
      busted: false,
      values: []
    }


    // Count how many aces and add up the other cards
    let aceCount = 0
    let nonAceTotal = 0; 
    for(let card of cards){
      let modCard = card % 51

      let convertedCard = cardConverter[modCard]
      console.log(convertedCard);
      if(convertedCard.value === 11){
        aceCount++;
      } else {
        nonAceTotal += convertedCard.value;
      }
    }

    // Generate all possible hand values


    if(aceCount){
      let highValue = nonAceTotal + 11
      let lowValue = nonAceTotal + 1

      if(aceCount > 1){
        highValue += (aceCount - 1) 
        lowValue += (aceCount - 1) 
      }
      handSummary.values.push(highValue)
      handSummary.values.push(lowValue)
    } else {
      handSummary.values.push(nonAceTotal)

    }

    // Check for soft 17 and if busted
    handSummary.busted = !handSummary.values.some(value => value <= 21);
    handSummary.softSeventeen = handSummary.values.includes(7) && handSummary.values.includes(17) && aceCount > 0;

    // Check for blackjack
    if(cards.length === 2 && handSummary.values.includes(21)) {
      handSummary.blackjack = true;
    }

    console.log(handSummary);

  return handSummary;
}



async function bestValue(values) {
  let underOrEqualTo21 = values.filter(v => v <= 21);
  if (underOrEqualTo21.length > 0) {
    console.log('BEST VALUE MAX: ', Math.max(...underOrEqualTo21));
    return Math.max(...underOrEqualTo21);
  } else {
    console.log('BEST VALUE MIN: ', Math.min(...values));

    return Math.min(...values);
  }
}




module.exports = {
  generateSeed,
  generateDeck,
  drawCards,
  shuffle,
  fetchLatestBlock,
  fetchSpecificBlockHash,
  getLatestBlockHeight,
  generateFloats,
  byteGenerator,
  handSummary,
  bestValue
};