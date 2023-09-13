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

const { botController } = require('./botController');
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

  startGlobalCountdown(io) {
    if (countdownInterval) return;

    countdownInterval = setInterval(async () => {
      for (const tableId in rooms) {
        await this.shouldTakeAction(io, tableId)
      }
    }, 1000); 
  },

  async shouldTakeAction(io, tableId) {
    const room = rooms[tableId];


    if (room.dealCardsTimeStamp && Date.now() >= room.dealCardsTimeStamp) {
      await this.handleDealAction(io, tableId)

    }

    if (rooms[tableId].tableId === 'be11a610-7777-7777-7777-7be11a610777' && !room.handInProgress) {      
      await botController.startBotRound(io, tableId)
    }


    return false;
  },






  async handleDealAction(io, tableId) {
    const room = rooms[tableId];
    room.dealCardsTimeStamp = null;



    if (room.gameType === 'Blackjack') {
      // ... additional logic if needed
1
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








};

module.exports = {
  timerController,
};
