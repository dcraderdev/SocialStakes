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
const { blackjackController } = require('./blackjackController');

const {
  roomInit,
  connections,
  rooms,
  disconnectTimeouts,
  disconnectTimes,
  lastPayouts,
} = require('../global');



let emitUpdatedTable = require('../utils/emitUpdatedTable') ;
let { countdownInterval } = require('../global');




const connectionController = {


  startGlobalCountdown(io, rooms) {
    console.log(rooms);
    if (countdownInterval) return;

    countdownInterval = setInterval(async () => {
      for (const tableId in rooms) {

        const room = rooms[tableId];

        // handle Blackjack time until deal logic
        if (room.dealCardsTimeStamp && Date.now() >= room.dealCardsTimeStamp) {
          room.dealCardsTimeStamp = null;

          if (room.gameType === 'Blackjack') {
          }

          // if theres bets, start hand otherwise cancel
          if (blackjackController.isNoBetsLeft(tableId)) {
            blackjackController.stopCountdownToDeal(tableId, io);
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


    console.log('-=-=-=-=-=-=-=-=-=');
    console.log('--- CONNECTING ---');
    console.log('SOCKET ID', socketId);
    console.log('A user connected', socketId, 'Username:', username);
    console.log('User Room:', userId);

    console.log('-=-=-=-=-=-=-=-=-=');

    socket.join(userId);
    socket.join('payoutMessages');

    if (username === 'anon') {
      socket.emit('initialize_anon_user', { lastPayouts });
      return;
    }

    const userFriends = await friendController.getUserFriends(userId);
    const userConversations = await chatController.getUserConversations(userId);

    if(!connections[userId]){
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
        
        let convoId = table.Table.Conversation.id
        let tableId = table.tableId;
        let seat = table.seat;
        let timer = 0;
        io.in(tableId).emit('player_reconnected', { seat, tableId, convoId, timer });
      }
    }


  },



  async handleDisconnection(socket, io) {
    console.log('-------------');
    console.log('handleDisconnection');
    console.log('-------------');

    const userId = socket.handshake.query.userId;
    const username = socket.handshake.query.username;
    const socketId = socket.id;
    let timer = 2000; // 10 seconds


    delete connections[userId][socketId]

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

      let hasOtherConnection = Object.values(connections[userId]).length

      
      if(!hasOtherConnection){
        delete connections[userId]
        delete disconnectTimeouts[userId];
        delete disconnectTimes[userId];
        this.disconnectUsersTables(socket, io)
      }

    
    }, timer);

  },





  async disconnectUsersTables(socket, io) {
    console.log('-------disconnectUsersTables-------');
    console.log('--------------');
    const userId = socket.handshake.query.userId;
    const username = socket.handshake.query.username;
    const socketId = socket.id;


    const userTables = await gameController.getUserTables(userId);
    if (userTables) {
      console.log('yep');
      console.log('yep');
      console.log('yep');
      console.log('yep');


      for (let table of userTables) {

        console.log(table);

        let userTableId = table.id;
        let convoId = table.Table.Conversation.id
        let tableId = table.tableId;
        let seat = table.seat
        let gameTable = rooms[tableId]
        let playerSeatObj = rooms[tableId].seats[seat]


        await gameController.removeUserFromTable(userTableId, userId)
        socket.leave(convoId);



        if(playerSeatObj){


          if (gameTable.gameType === 'Blackjack') {
    
            this.handleLeaveBlackjackTable(socket, io, gameTable, playerSeatObj)
      
          }




        }






        // console.log(tableId);
        // console.log(userTableId);
        // console.log(userId);
        // console.log(seat);
        // console.log(convoId);
        // console.log(playerSeatObj);


        // set userTable to active = false
        // gameController.removeUserFromTables(userId)




      }
    }
  


return


},







  





};

module.exports = {
  connectionController,
};
