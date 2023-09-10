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

let emitCustomMessage = require('../utils/emitCustomMessage');
let fetchUpdatedTable = require('../utils/fetchUpdatedTable');

let { countdownInterval } = require('../global');

const timerController = {
  startGlobalCountdown(io, rooms) {
    console.log(rooms);
    if (countdownInterval) return;

    countdownInterval = setInterval(async () => {
      console.log('tick');
      for (const tableId in rooms) {
        const room = rooms[tableId];

        // handle Blackjack time until deal logic
        if (room.dealCardsTimeStamp && Date.now() >= room.dealCardsTimeStamp) {

          console.log('time up');
          room.dealCardsTimeStamp = null;

          if (room.gameType === 'Blackjack') {




          }

          // if theres bets, start hand otherwise cancel
          if (!blackjackController.anyBetsLeft(tableId)) {
            console.log('no bets');
            console.log('no bets');
            console.log('no bets');
            blackjackController.stopCountdownToDeal(io, tableId);
            continue;
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
          // dealCards(tableId, io);
        }
      }
    }, 1000); 
  },


  checkTables(){

  },




};

module.exports = {
  timerController,
};
