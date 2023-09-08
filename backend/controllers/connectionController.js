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
const { cardConverter } = require('./cardConverter');
const { botController } = require('./botController');

const {
  roomInit,
  connections,
  rooms,
  disconnectTimeouts,
  disconnectTimes,
  lastPayouts,
} = require('../global');

let countdownInterval = null;

function isNoBetsLeft(rooms, tableId) {
  if (!rooms[tableId]) return true;

  // Iterate over all seats in the room to check for any remaining bets
  for (let seat in rooms[tableId].seats) {
    if (rooms[tableId].seats[seat].pendingBet > 0) {
      return false; // If there is a bet, return false
    }
  }
  // If no bets are found, return true
  return true;
}

function stopTimer(rooms, tableId) {
  let room = tableId;
  let countdownObj = { dealCardsTimeStamp: 0, tableId };

  rooms[tableId].dealCardsTimeStamp = null;
  io.in(room).emit('countdown_update', countdownObj);
}

const connectionController = {
  startGlobalCountdown(io, rooms) {
    console.log(rooms);
    if (countdownInterval) return;

    countdownInterval = setInterval(async () => {
      console.log('tick');
      for (const tableId in rooms) {
        console.log(tableId);

        const room = rooms[tableId];

        // handle Blackjack time until deal logic
        if (room.dealCardsTimeStamp && Date.now() >= room.dealCardsTimeStamp) {
          room.dealCardsTimeStamp = null;

          if (room.gameType === 'Blackjack') {
          }

          // if theres bets, start hand otherwise cancel
          if (isNoBetsLeft(rooms, tableId)) {
            stopTimer(rooms, tableId);
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

  async startConnection(socket, io) {
    const userId = socket.handshake.query.userId;
    const username = socket.handshake.query.username;
    const socketId = socket.id;

    socket.join(userId);
    socket.join('winners');

    if (username === 'anon') {
      socket.emit('initialize_anon_user', { lastPayouts });
      return;
    }

    const userFriends = await friendController.getUserFriends(userId);
    const userConversations = await chatController.getUserConversations(userId);

    connections[userId] = {};

    connections[userId][socketId] = {
      socket: socket,
      status: 'connected',
      connectedAt: Date.now(),
      timeOfLastAction: Date.now(),
    };

    if (userConversations) {
      Object.keys(userConversations).map((conversation) => {
        socket.join(conversation);
      });
    }

    let initObj = {
      userFriends,
      userConversations,
      lastPayouts,
    };

    socket.emit('initialize_user', initObj);
  },

  checkReconnection(socket, io) {
    const userId = socket.handshake.query.userId;

    if (disconnectTimeouts[userId]) {
      return true;
    }

    return false;
  },

  async handleReconnection(socket, io) {
    const userId = socket.handshake.query.userId;
    const username = socket.handshake.query.username;
    const socketId = socket.id;

    await this.startConnection(socket, io);

    clearTimeout(disconnectTimeouts[userId]);
    // console.log(`User ${username} reconnected, timeout cleared.`);
    delete disconnectTimeouts[userId];
    delete disconnectTimes[userId];

    const userTables = await gameController.getUserTables(userId);

    
    
    if (userTables) {
      for (let table of userTables) {
        
        let convoId = table.Table.Conversation.id
        let tableId = table.tableId;
        let seat = table.seat;
        let timer = 0;
        let messageObj = {
          tableId,
          user: { username: 'Room', id: 1, rank: 0 },
          message: {
            content: `${username} has reconnected.`,
            id: 0,
          }, 
        };
        
        console.log('!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#');
        console.log('!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#');
        console.log('!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#');
        console.log('!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#');
        console.log(convoId);
        console.log('!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#');
        console.log('!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#');
        console.log('!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#');
        console.log('!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#');
        // io.in(tableId).emit('new_message', messageObj);
        io.in(tableId).emit('player_reconnected', { seat, tableId, convoId, timer });
      }
    }
  },
};

module.exports = {
  connectionController,
};
