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


const connectionController = {
  

  async startConnection(socket, io) {
    const userId = socket.handshake.query.userId;
    const username = socket.handshake.query.username;
    const socketId = socket.id;

    // console.log('-=-=-=-=-=-=-=-=-=');
    // console.log('--- CONNECTING ---');
    // console.log('SOCKET ID', socketId);
    // console.log('A user connected', socketId, 'Username:', username);
    // console.log('User Room:', userId);
    // console.log('-=-=-=-=-=-=-=-=-=');

    socket.join(userId);
    socket.join('payoutMessages');

    if (username === 'anon') {
      socket.emit('initialize_anon_user', { lastPayouts });
      return;
    }

    const userFriends = await friendController.getUserFriends(userId);
    const userConversations = await chatController.getUserConversations(userId);

    if (!connections[userId]) {
      connections[userId] = {};
    }

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

  checkIsReconnecting(socket, io) {
    const userId = socket.handshake.query.userId;
    const socketId = socket.id;

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
        let convoId = table.Table.Conversation.id;
        let tableId = table.tableId;
        let seat = table.seat;
        let timer = 0;

        this.joinTable(socket, io, tableId)
        io.in(tableId).emit('player_reconnected', {
          seat,
          tableId,
          convoId,
          timer,
        });
      }
    }
  },

  async handleDisconnection(socket, io) {

    const userId = socket.handshake.query.userId;
    const username = socket.handshake.query.username;
    const socketId = socket.id;
    let timer = 2000; // 10 seconds

    delete connections[userId][socketId];

    disconnectTimes[userId] = Date.now();

    // Clear the existing timeout for this user (if any)
    if (disconnectTimeouts[userId]) {
      clearTimeout(disconnectTimeouts[userId]);
    }

    // Start a new timeout for this user
    disconnectTimeouts[userId] = setTimeout(async () => {
      // Check the elapsed time since disconnect
      let elapsedSeconds = Math.floor(
        (Date.now() - disconnectTimes[userId]) / 1000
      );
      if (elapsedSeconds < timer / 1000) {
        return;
      }

      // check if user has other sockets open, if not clear data and close tables

      let hasOtherConnection = Object.values(connections[userId]).length;

      if (!hasOtherConnection) {
        delete connections[userId];
        delete disconnectTimeouts[userId];
        delete disconnectTimes[userId];
        this.disconnectUsersTables(socket, io);
      }
    }, timer);
  },

  async disconnectUsersTables(socket, io) {
    const userId = socket.handshake.query.userId;
    const username = socket.handshake.query.username;
    const socketId = socket.id;

    const userTables = await gameController.getUserTables(userId);
    if (userTables) {
      for (let table of userTables) {

        let userTableId = table.id;
        let convoId = table.Table.Conversation.id;
        let tableId = table.tableId;
        let seat = table.seat;
        let gameTable = rooms[tableId];
        let playerSeatObj = rooms[tableId].seats[seat];


        socket.leave(convoId);
        socket.leave(convoId);
        
        if (playerSeatObj) {
          if (gameTable.gameType === 'Blackjack') {
            await blackjackController.handleLeaveBlackjackTable(
              io,
              gameTable,
              playerSeatObj
              );
            }
          } else {
          await gameController.removeUserFromTable(userTableId, userId)
        }
      }
    }
    return;
  },


  async joinTable(socket, io, tableId) {
    const userId = socket.handshake.query.userId;
    const username = socket.handshake.query.username;
    const socketId = socket.id;

    
    
    let updatedTable = await fetchUpdatedTable(tableId);
    if (!updatedTable) return;

     let updateObj = {
      tableId,
      table: {
        actionSeat: rooms[tableId].actionSeat,
        actionHand: rooms[tableId].actionHand,
        dealCardsTimeStamp: rooms[tableId].dealCardsTimeStamp,
        actionEndTimeStamp: rooms[tableId].actionEndTimeStamp,
        handInProgress: rooms[tableId].handInProgress,
        seats: rooms[tableId].seats,
        gameSessionId: rooms[tableId].gameSessionId,
        dealerCards: {
          visibleCards: rooms[tableId].dealerCards.visibleCards,
        },
        conversationId: rooms[tableId].conversationId,
        chatName: rooms[tableId].chatName,
      },
    };

    
    let conversationId = rooms[tableId].conversationId;
    let content = `${username} has joined the room.`;

    socket.join(conversationId);
    socket.join(tableId);

    await emitCustomMessage( io, { conversationId, content, tableId });


    io.in(userId).emit('join_table', updatedTable);

    socket.emit('view_table', { id: tableId, conversationId });
    io.in(userId).emit('get_updated_table', updateObj);

  },









};

module.exports = {
  connectionController,
};
