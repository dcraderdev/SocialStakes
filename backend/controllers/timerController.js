const {
  Card,
  Deck,
  User,
  Friendship,
  UserFriendship,
  UserHand,
  Game,
  Table,
  UserGame,
  UserTable,
  DeckCard,
  Message,
  Conversation,
  UserConversation,
} = require('../db/models');

const { gameController } = require('./gameController');
const { chatController } = require('./chatController');
const { friendController } = require('./friendController');
const { blackjackController } = require('./blackjackController');

const {
  roomInit,
  connections,
  rooms,
  disconnectTimeouts,
  disconnectTimes,
  lastPayouts,
} = require('../global');


let { countdownInterval } = require('../global');


const timerController = {

  startGlobalCountdown(io, rooms) {
    if (countdownInterval) return;

    countdownInterval = setInterval(async () => {
      for (const tableId in rooms) {
        if (this.shouldTakeAction(tableId, rooms)) {
          await this.handleAction(io, tableId, rooms);
        }
      }
    }, 1000); 
  },

  shouldTakeAction(tableId, rooms) {
    const room = rooms[tableId];

    if (room.dealCardsTimeStamp && Date.now() >= room.dealCardsTimeStamp) {
      return true;
    }
    return false;
  },



  
  async handleAction(io, tableId, rooms) {
    const room = rooms[tableId];
    console.log('time up');
    room.dealCardsTimeStamp = null;

    if (room.gameType === 'Blackjack') {
      // ... additional logic if needed
    }

    // if there are no bets, start hand otherwise cancel
    if (!blackjackController.anyBetsLeft(tableId)) {
      blackjackController.stopCountdownToDeal(io, tableId);
      return;
    }

    room.handInProgress = true;

    // Transfer pendingBet to currentBet for each seat
    for (let seatKey in room.seats) {
      const seat = room.seats[seatKey];
      seat.currentBet += seat.pendingBet;
      seat.pendingBet = 0;
    }

    let updateObj = {
      tableId,
      table: {
        handInProgress: true,
        seats: room.seats,
      },
    };

    io.in(tableId).emit('get_updated_table', updateObj);

    // Countdown finished, emit event to collect all bets
    let countdownObj = {
      dealCardsTimeStamp: room.dealCardsTimeStamp,
      tableId,
    };
    io.in(tableId).emit('collect_bets', countdownObj);
    await blackjackController.dealCards(io, tableId);
  },

  checkTables(){
    //... Logic for checkTables (if needed)
  }
};

module.exports = {
  timerController,
};
