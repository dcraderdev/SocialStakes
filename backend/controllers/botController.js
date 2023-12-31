const {
  User,
  Game,
  Table,
  UserTable,
  ServerSeed,
  Message,
  Round,
  Hand,
  GameSession,
  Conversation,
  UserConversation,
  Action,
  Friendship,
  Pot,
  UserPot,
} = require('../db/models');

const {
  roomInit,
  connections,
  rooms,
  disconnectTimeouts,
  disconnectTimes,
  lastPayouts,
} = require('../global');

const { drawCards, handSummary, bestValue } = require('./cardController');


const { gameController } = require('./gameController');
const { cardConverter } = require('./cardConverter');
const setDealCardsTimeStamp = require('../utils/setDealCardsTimeStamp');
// const { blackjackController } = require('./blackjackController');
let emitCustomMessage = require('../utils/emitCustomMessage');
const emitUpdatedTable = require('../utils/emitUpdatedTable');



const botController = {
  buyInAmount: 5000,

  async handleBotInit() {
    let bots = [
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a83',
        username: 'Jeff Ma',
      },
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a84',
        username: 'John Chang',
      },
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a85',
        username: 'Bill Kaplan',
      },
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a86',
        username: 'Mike Aponte',
      },
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a87',
        username: 'Jane Willis',
      },
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a88',
        username: 'Seymon Dukach',
      },
    ];

    let bellagioTableId = 'be11a610-7777-7777-7777-7be11a610777';

    let updatedTable = await gameController.getTableById(bellagioTableId);
    if (!updatedTable) return;

    if (!rooms[bellagioTableId]) {
      rooms[bellagioTableId] = roomInit();
      rooms[bellagioTableId].tableId = bellagioTableId;
      rooms[bellagioTableId].gameSessionId = updatedTable.gameSessions[0].id;
      rooms[bellagioTableId].blockHash = updatedTable.gameSessions[0].blockHash;
      rooms[bellagioTableId].decksUsed = updatedTable.Game.decksUsed;
      rooms[bellagioTableId].shufflePoint = updatedTable.shufflePoint;
      rooms[bellagioTableId].conversationId = updatedTable.Conversation.id;
      rooms[bellagioTableId].chatName = updatedTable.Conversation.chatName;
      rooms[bellagioTableId].gameType = updatedTable.Game.shortName;
      rooms[bellagioTableId].Game = updatedTable.Game;
    }

    bots.forEach(async (user, index) => {
      let tableId = bellagioTableId;
      let seat = index + 1;
      let amount = 100;

      await gameController.removeUserFromTables(user.id);

      const takeSeat = await gameController.takeSeat(
        tableId,
        seat,
        user,
        amount
      );

      if (takeSeat) {
        const takeSeatObj = {
          id: takeSeat.id,
          seat: takeSeat.seat,
          tableBalance: takeSeat.tableBalance,
          tableId: takeSeat.tableId,
          userId: takeSeat.userId,
          disconnectTimer: takeSeat.disconnectTimer,
          pendingBet: takeSeat.pendingBet,
          currentBet: takeSeat.currentBet,
          username: user.username,
          forfeit: false,
          hands: {},
          cards: [],
          insurance: {
            accepted: false,
            bet: 0,
          },
        };

        rooms[tableId].seats[seat] = takeSeatObj;
      }
    });
  },



  async startBotRound(io, tableId) {
    const seats = rooms[tableId].seats;

    // iterate over bots
    Object.values(seats).map(async (seat, index) => {
      await this.handleBotBetDecision(io, tableId, seat);
    });
  },



  async handleBotBetDecision(io, tableId, seat) {
    // check chip stack
    // check card count
    // make bet

    const room = rooms[tableId];
    let minBet = rooms[tableId].Game.minBet;
    let hasBalance = seat.tableBalance > (minBet * 5);
    let hasPendingBet = seat.pendingBet > 0;

    
    if(hasPendingBet) return
    
    
    let bet = minBet;

    if (!hasBalance) {
      let room = tableId;
      let userId = seat.userId;
      let userTableId = seat.id;
      let amount;

      const currUser = await User.findByPk(userId);
      let balanceNotInPlay = currUser.balance;
 

      if (balanceNotInPlay > this.buyInAmount) {
        amount = this.buyInAmount;
      } else if (amount === 0) {
        return;
      } else {
        amount = balanceNotInPlay;
      }

      const seatObj = { tableId, seat, userId, amount, userTableId };
      const addFunds = await gameController.addFunds(seatObj);
      if (!addFunds) {
        return;
      }

      if (addFunds) { 
        if (rooms[tableId] && rooms[tableId].seats[seat.seat]) {
          rooms[tableId].seats[seat.seat].tableBalance += amount;
        }  


      console.log('new balance:', rooms[tableId].seats[seat.seat]);
        io.in(room).emit('player_add_table_funds', seatObj);
        emitUpdatedTable(io, tableId)
      }
    } 

    // If handInProgress, dont add the bet
    if (room.handInProgress) {
      return;
    }

    // Update pendingBet in the rooms object
    seat.pendingBet += bet;
    seat.tableBalance -= bet;

    if (!rooms[tableId].dealCardsTimeStamp) {
      setDealCardsTimeStamp(io, tableId);
    }

    const betObj = { bet, tableId, seat: seat.seat };

    io.in(tableId).emit('new_bet', betObj);
  },



  getActionForHand(playerHandValue, dealerCardValue, canSplit = false, enoughFunds = false) {


    if (playerHandValue <= 8) {
      return 'hit';
    }

    if (playerHandValue === 20) {
      return 'stay';
    } 

    if (playerHandValue === 9) {
      if (dealerCardValue >= 3 && dealerCardValue <= 6  && enoughFunds) {
        return 'double';
      } else {
        return 'hit';
      }
    }

    if (playerHandValue === 10) {
      if (dealerCardValue <= 9  && enoughFunds) {
        return 'double';
      } else {
        return 'hit';
      }
    }

    if (playerHandValue === 11) {
      if (dealerCardValue <= 10 && enoughFunds) {
        return 'double';
      } else {
        return 'hit';
      }
    }

    if (playerHandValue >= 12 && playerHandValue <= 16) {
      if (dealerCardValue <= 6) {
        return 'stay';
      } else {
        return 'hit';
      }
    }

    if (playerHandValue >= 17) return 'stay';

    if (canSplit && enoughFunds) {

      return 'split';
      
    } else {
      return 'stay';
    }
    
  },

  getCardValueFromConverter(card) {
    const modCard = card % 51;
    return cardConverter[modCard].value;
  },

  computeHandValue(cards) {
    let total = 0;
    let aces = 0;

    for (const card of cards) {
      const value = this.getCardValueFromConverter(card);
      total += value;
      if (value === 11) aces++;
    }

    while (total > 21 && aces) {
      total -= 10;
      aces--;
    }

    return total;
  },

  async handleBotAction(io, tableId) {
    const room = rooms[tableId];
    let actionSeat = room.actionSeat;
    let actionHand = room.actionHand;
    if (!actionHand || !actionSeat) return;
    let currentHand = room.seats[actionSeat].hands[actionHand];

    let playerFunds = room.seats[actionSeat].tableBalance;
    let currentBet = currentHand.bet;

    let dealerCards = room.dealerCards;
    let username = room.seats[actionSeat].username;

    const dealerVisibleCard = dealerCards.visibleCards[0];
    const dealerCardValue = this.getCardValueFromConverter(dealerVisibleCard);
    const playerHandValue = this.computeHandValue(currentHand.cards);

    // Check if the hand can be split (both cards have the same value)
    const canSplit =
      currentHand.cards.length === 2 &&
      this.getCardValueFromConverter(currentHand.cards[0]) ===
        this.getCardValueFromConverter(currentHand.cards[1]);

    const enoughFunds = playerFunds >= currentBet;

    let action = this.getActionForHand(
      playerHandValue,
      dealerCardValue,
      canSplit,
      enoughFunds
    );

    let actionObj = {
      tableId,
      seat: actionSeat,
      handId: actionHand,
    };


    // add delay
    //if action is 'stay' we want to move along quickly
    // let waitTime = Math.floor(Math.random() * 10000)
    let waitTime = action === 'stay' ? 1000 : Math.floor(Math.random() * 10000)
    await new Promise((resolve) => setTimeout(resolve, waitTime));


      let playerBestValue = await bestValue(currentHand.summary.values);
      
      let messageObj = {
        conversationId: rooms[tableId].conversationId,
        content: `${username} shows: `,
        tableId,
      };
      

      if (action === 'hit') {
        await this.playerHit(actionObj);
        messageObj.content = `${username} hits!`;
      }
      if (action === 'stay') {
        await this.playerStay(actionObj);
        messageObj.content = `${username} stays. ${playerBestValue}.`;
      }
      if (action === 'double') {
        await this.playerDouble(io, actionObj);
        messageObj.content = `${username} doubles! `;
      }
      if (action === 'split') {
        await this.playerSplit(io, actionObj);
        messageObj.content = `${username} splits! `;
      }

      await emitCustomMessage( io, messageObj);
      emitUpdatedTable(io, tableId)


  },







  async playerHit(actionObj) {
    const { tableId, seat, handId } = actionObj;

    let currentHand = rooms[tableId].seats[seat].hands[handId];
    let cardsToDraw = 1;

    let drawObj = {
      deck: rooms[tableId].deck,
      cardsToDraw,
      cursor: rooms[tableId].cursor,
    };

    const drawnCardsAndDeck = drawCards(drawObj);
    const { drawnCards, newDeck } = drawnCardsAndDeck;

    rooms[tableId].deck = newDeck;

    // const newCard = await drawCards(drawObj)
    rooms[tableId].cursor += cardsToDraw;
    currentHand.cards.push(...drawnCards);
    return;
  },

  // Handle player stay action
  async playerStay(actionObj) {
    const { tableId, action, seat, handId } = actionObj;

    // Update hand to show no more decisions need to be made for the gameLoop
    let playersHand = rooms[tableId].seats[seat].hands[handId];


    playersHand.turnEnded = true;
    return;
  },

  async playerSplit(io, actionObj) {
    const { tableId, action, seat, handId } = actionObj;
    let room = tableId;
    let userTableId = rooms[tableId].seats[seat].id;
    let roundId = rooms[tableId].roundId;
    let currentSeat = rooms[tableId].seats[seat];

    // Create new hand for the split
    const newHand = await gameController.createHand(userTableId, roundId);
    let newHandId = newHand.id;

    if (!newHand) {
      await gameLoop(io, tableId);
    }

    if (newHand) {
      // Get the existing hand
      let existingHand = rooms[tableId].seats[seat].hands[handId];

      if (existingHand.cards.length < 2) {
        return;
      }

      // Remove chips from table balance if available
      if (currentSeat.tableBalance < existingHand.bet) return;
      currentSeat.tableBalance -= existingHand.bet;

      // Split the cards between the two hands
      // Add the current bet to the newHands bet
      let cardToMove = existingHand.cards.pop();
      let newSplitHand = {
        cards: [cardToMove],
        bet: existingHand.bet,
        turnEnded: false,
      };

      // Update the hands
      rooms[tableId].seats[seat].hands[newHandId] = newSplitHand;
    }

    // let updateObj = {
    //   tableId,
    //   table: {
    //     seats: rooms[tableId].seats,
    //   },
    // };

    // io.in(room).emit('get_updated_table', updateObj);
    emitUpdatedTable(io, tableId)

    return;
  },

  async playerDouble(io, actionObj) {

    const { tableId, action, seat, handId } = actionObj;
    let currentSeat = rooms[tableId].seats[seat];
    let currentHand = rooms[tableId].seats[seat].hands[handId];
    let currentBet = rooms[tableId].seats[seat].hands[handId].bet;
    let username = rooms[tableId].seats[seat].username
    let cardsToDraw = 1;
    let drawObj = {
      deck: rooms[tableId].deck,
      cardsToDraw,
      cursor: rooms[tableId].cursor,
    };

    // Double the current bet, remove chips from table balance
    // currentBet *= 2;
    currentSeat.tableBalance -= currentBet;

    // Save the updated balance and bet in rooms object
    currentHand.bet += currentBet;

    // // Draw one more card and push to currentHand
    // const newCard = await drawCards(drawObj)
    // currentHand.cards.push(newCard);
    // rooms[tableId].cursor += cardsToDraw

    const drawnCardsAndDeck = drawCards(drawObj);
    const { drawnCards, newDeck } = drawnCardsAndDeck;

    rooms[tableId].deck = newDeck;

    // const newCard = await drawCards(drawObj)
    rooms[tableId].cursor += cardsToDraw;
    currentHand.cards.push(...drawnCards);

    let playerHand = await handSummary(currentHand.cards);
    let valuesStr = playerHand.values.join(',');

    let messageObj = {
      conversationId: rooms[tableId].conversationId,
      content: `${username} shows: ${valuesStr}`,
      tableId,
      cards: currentHand.cards,
    };


    
    // Update hand to show no more decisions need to be made for the gameLoop
    let playersHand = rooms[tableId].seats[seat].hands[handId];
    playersHand.turnEnded = true;
    rooms[tableId].seats[seat].hands[handId] = playersHand;
    
    
    
    await emitCustomMessage( io, messageObj);
    emitUpdatedTable(io, tableId)

    return;

    // End players turn
    // rooms[tableId].sortedFinishedPlayers.push(nextPlayer)
  },












};

module.exports = { botController };
