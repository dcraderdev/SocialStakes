const { gameController } = require('./controllers/gameController');
const { chatController } = require('./controllers/chatController');
const { friendController } = require('./controllers/friendController');
const { cardConverter } = require('./controllers/cardConverter');
const { botController } = require('./controllers/botController');
const { connectionController } = require('./controllers/connectionController');
const { blackjackController } = require('./controllers/blackjackController');
const { timerController } = require('./controllers/timerController');

const {
  drawCards,
  handSummary,
  bestValue,
} = require('./controllers/cardController');

const {
  roomInit,
  connections,
  rooms,
  disconnectTimeouts,
  disconnectTimes,
  lastPayouts,
} = require('./global');

let { countdownInterval } = require('./global');

let emitUpdatedTable = require('./utils/emitUpdatedTable');
let fetchUpdatedTable = require('./utils/fetchUpdatedTable');
let emitCustomMessage = require('./utils/emitCustomMessage');
let setDealCardsTimeStamp = require('./utils/setDealCardsTimeStamp');



module.exports = function (io) {

  async function initializeRooms() {
    if (!Object.values(rooms).length) {
      await gameController.initializeTables();
    }
  }

  async function initializeBot() {
    if (!rooms['be11a610-7777-7777-7777-7be11a610777']) {
      await botController.handleBotInit();
    }
  }

  async function initializeCounter() {
    if (!countdownInterval) {
      countdownInterval = timerController.startGlobalCountdown(io);
    }
  }
 
  initializeRooms();
  initializeBot();
  initializeCounter();

  // _*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
  // _*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
  // _*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
  // _*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_

  io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId;
    const username = socket.handshake.query.username;


    if (username === 'anon') {
      await connectionController.startConnection(socket, io);
      return;
    }

    let isReconnecting = connectionController.checkIsReconnecting(socket, io);

    if (isReconnecting) {
      await connectionController.handleReconnection(socket, io);
    } else {
      await connectionController.startConnection(socket, io);
    }





    socket.on('disconnect', async () => {
      connectionController.handleDisconnection(socket, io);
    });


    socket.on('disconnect_user', async () => {
      connectionController.disconnectUsersTables(socket, io);
    });



    socket.on('join_room', async (tableId) => {
      connectionController.joinTable(socket, io, tableId)
    });



    socket.on('view_room', async (tableId) => {
      let conversationId = rooms?.[tableId]?.conversationId;
      let table = { id: tableId, conversationId };
      socket.emit('view_table', table);
    });


    socket.on('update_table_name', async (updateObj) => {
      const { tableId, tableName } = updateObj;
      if (!tableId || !tableName) return;
      let content = `${username} has updated the table name to ${tableName}.`;
      let conversationId = rooms?.[tableId]?.conversationId;

      await emitCustomMessage( io, { conversationId, content, tableId });
      io.in(conversationId).emit('update_table_name', updateObj);
    });



    socket.on('close_table', async (tableId) => {
      let room = tableId;
      let allSeats;
      if (rooms[tableId]) {
        allSeats = Object.values(rooms[tableId].seats);
      }

      let leaveSeatPromises = allSeats.map((seat) => {
        let leaveSeatObj = {
          tableId,
          seat: seat.seat,
          userTableId: seat.id,
          userId: seat.userId,
          tableBalance: seat.tableBalance,
        };

        gameController.leaveSeat(leaveSeatObj);

        io.in(userId).emit('player_leave', leaveSeatObj);
        // handleEmit('player_leave', leaveSeatObj, userId);
        return;
      });

      await Promise.all(leaveSeatPromises);
      await gameController.closeTable(tableId);

      delete rooms[tableId];
      io.to(room).emit('close_table', tableId);

    });

    socket.on('take_seat', async (seatObj) => {
      const { room, seat, user, amount } = seatObj;
      let tableId = room;

      const takeSeat = await gameController.takeSeat(
        tableId,
        seat,
        user,
        amount
      );

      if (!takeSeat) {
        return;
      }

      takeSeat['username'] = user.username;

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

      // If the room doesnt exist create a new room
      if (!rooms[tableId]) {
        await fetchUpdatedTable(tableId);
      }

      // Add the player to the room
      rooms[tableId].seats[seat] = takeSeatObj;

      let content = `${username} has taken seat ${seat}.`;
      let conversationId = rooms?.[tableId]?.conversationId;

      await emitCustomMessage( io, { conversationId, content, tableId });

      // io.in(room).emit('new_message', messageObj);
      io.in(room).emit('new_player', takeSeatObj);

      // console.log('--------------');
      // console.log(`${username} taking seat${seat} in ${room}`);
      // console.log('--------------');
    });

    socket.on('leave_seat', async (seatObj) => {
      const { tableId, seat } = seatObj;
      let table = rooms[tableId];

      if (table && table.seats[seat]) {
        let playerSeatObj = table.seats[seat];
        if (table.gameType === 'Blackjack') {
          await blackjackController.handleLeaveBlackjackTable(
            io,
            table,
            playerSeatObj
          );
        }
      }
    });

    socket.on('leave_table', async (seatObj) => {
      // console.log('--------------');
      // console.log(`leave_table`);
      // console.log('--------------');
      const { tableId, seat } = seatObj;
      let table = rooms[tableId];

      if (table && table.seats[seat]) {
        let playerSeatObj = table.seats[seat];

        if (table.gameType === 'Blackjack') {
          await blackjackController.handleLeaveBlackjackTable(
            io,
            table,
            playerSeatObj
          );
        }

        io.in(userId).emit('leave_table', tableId);
      }
    });

    socket.on('remove_last_bet', async (betObj) => {
      const { tableId, seat, lastBet } = betObj;
      let room = tableId;

      // Update pendingBet in the rooms object
      if (rooms[tableId] && rooms[tableId].seats[seat]) {
        rooms[tableId].seats[seat].pendingBet -= lastBet;
        rooms[tableId].seats[seat].tableBalance += lastBet;
      }

      io.in(room).emit('remove_last_bet', betObj);

      if (!blackjackController.anyBetsLeft(tableId)) {
        blackjackController.stopCountdownToDeal(io, tableId);
      }
    });

    socket.on('remove_all_bet', async (betObj) => {
      const { tableId, seat, lastBet } = betObj;
      let room = tableId;
 
      // Update pendingBet in the rooms object
      if (rooms[tableId] && rooms[tableId].seats[seat]) {
        let pendingBet = rooms[tableId].seats[seat].pendingBet;
        rooms[tableId].seats[seat].tableBalance += pendingBet;
        rooms[tableId].seats[seat].pendingBet = 0;
      }

      io.in(room).emit('remove_all_bet', betObj);

      if (!blackjackController.anyBetsLeft(tableId)) {
        blackjackController.stopCountdownToDeal(io, tableId);
      }
    });

    socket.on('place_bet', async (betObj) => {
      const { bet, tableId, seat } = betObj;
      let room = tableId;

      // If the room doesnt exist create a new room
      if (!rooms[tableId]) {
        let updatedTable = await gameController.getTableById(tableId);
        rooms[tableId] = roomInit();
        rooms[tableId].gameSessionId = updatedTable.gameSessions[0].id;
        rooms[tableId].decksUsed = updatedTable.Game.decksUsed;
      }

      // If handInProgress, dont add the bet
      if (rooms[tableId].handInProgress) {
        return;
      }

      // Update pendingBet in the rooms object
      if (rooms[tableId] && rooms[tableId].seats[seat]) {
        rooms[tableId].seats[seat].pendingBet += bet;
        rooms[tableId].seats[seat].tableBalance -= bet;
      }

      if (!rooms[tableId].dealCardsTimeStamp) {
        setDealCardsTimeStamp(io, tableId);
      }

      io.in(room).emit('new_bet', betObj);
    });


    socket.on('add_funds', async (seatObj) => {
      const { tableId, seat, userId, amount } = seatObj;
      let room = tableId;
      let userTableId;

      //Server resets and throws error while working
      // This prevents the error from being thrown until we can reset seat
      if (rooms[tableId].seats[seat].id) {
        userTableId = rooms[tableId].seats[seat].id;
      }
      //attach userTableId to seat Obj
      seatObj.userTableId = userTableId;

      const addFunds = await gameController.addFunds(seatObj);

      if (!addFunds) {
        return;
      }

      if (addFunds) {
        if (rooms[tableId] && rooms[tableId].seats[seat]) {
          rooms[tableId].seats[seat].tableBalance += amount;
        }
        io.in(room).emit('player_add_table_funds', seatObj);
      }

      // console.log('--------------');
      // console.log(`Adding funds(${amount}) for ${username} @room ${room}`);
      // console.log('--------------');
    });

    socket.on('accept_insurance', async (betObj) => {
      const { bet, insuranceCost, tableId, seat } = betObj;

      let room = tableId;
      let currentHandId = Object.keys(rooms[tableId].seats[seat].hands)[0];

      // remove insurance cost form players tableBalance
      rooms[tableId].seats[seat].tableBalance -= insuranceCost;
      //update hand to show insurance was accepted

      // console.log('------- INSURANCE CHECK -------');
      // console.log('currentHandId', currentHandId);
      // console.log('rooms[tableId].seats[seat]', rooms[tableId].seats[seat]);
      // console.log(
      //   'rooms[tableId].seats[seat]',
      //   rooms[tableId].seats[seat].hands
      // );
      // // console.log('rooms[tableId].seats[seat].hands',rooms[tableId].seats[seat].hands);
      // console.log('------------------------');

      rooms[tableId].seats[seat]['insurance'] = {
        accepted: true,
        bet: bet,
      };

      // Add player to insured players array
      rooms[tableId].insuredPlayers[seat] = insuranceCost;

      emitUpdatedTable(io, tableId)
    });


    socket.on('player_action', async (actionObj) => {
      const { tableId, action, seat, handId } = actionObj;

      if (!rooms[tableId]) return;

      // Reset the timer whenever a player takes an action
      if (rooms[tableId] && rooms[tableId].timerId) {
        clearInterval(rooms[tableId].timerId);
        rooms[tableId].actionEndTimeStamp = 0;
      }

      
      let player = rooms[tableId].seats[seat];
      let currentHand = player.hands[handId];


      let playerBestValue = await bestValue(currentHand.summary.values);
      
      let messageObj = {
        conversationId: rooms[tableId].conversationId,
        content: `${player.username} shows: `,
        tableId,
      };
      

      if (action === 'hit') {
        await blackjackController.playerHit(actionObj);
        messageObj.content = `${player.username} hits!`;
      }
      if (action === 'stay') {
        await blackjackController.playerStay(actionObj);
        messageObj.content = `${player.username} stays. ${playerBestValue}.`;
      }
      if (action === 'double') {
        await blackjackController.playerDouble(io, actionObj);
        messageObj.content = `${player.username} doubles! `;
      }
      if (action === 'split') {
        await blackjackController.playerSplit(io, actionObj);
        messageObj.content = `${player.username} splits! `;
      }

      await emitCustomMessage( io, messageObj);

      await blackjackController.gameLoop(io, tableId);
    });


    socket.on('send_friend_request', async (friendRequestObj) => {
      let recipientId = friendRequestObj.recipientId;
      let recipientUsername = friendRequestObj.recipientUsername;

      friendRequestObj.username = username;
      friendRequestObj.userId = userId;

      const request = await friendController.sendFriendRequest(
        friendRequestObj
      );

      if (request) {
        const { friendship, newConversation } = request;

        let senderObj = {
          conversationId: newConversation?.id,
          friend: {
            id: recipientId,
            username: recipientUsername,
          },
          requestInfo: {
            id: friendship.id,
            status: friendship.status,
          },
        };

        let recipientObj = {
          conversationId: newConversation?.id,
          friend: {
            id: userId,
            username,
          },
          requestInfo: {
            id: friendship.id,
            status: friendship.status,
          },
        };

        if (friendship.status === 'accepted') {
          handleAcceptFriendRequest(recipientObj, senderObj, request);
        }

        if (friendship.status === 'rejected') {
          senderObj.status = 'pending';
          socket.emit('friend_request_sent', senderObj);
        }

        if (friendship.status === 'pending') {
          io.in(recipientId).emit('friend_request_received', recipientObj);
          socket.emit('friend_request_sent', senderObj);
        }
      }
    });

    function handleAcceptFriendRequest(recipientObj, senderObj, request) {
      let recipientId = senderObj.friend.id;
      let senderConnections = connections[userId];
      let recipientConnections = connections[recipientId];
      const { friendship, newConversation } = request;

      let convoObj = {
        isDirectMessage: newConversation.isDirectMessage,
        hasDefaultChatName: newConversation.hasDefaultChatName,
        chatName: newConversation.chatName,
        conversationId: newConversation.id,
        members: newConversation.members,
        messages: [],
        notification: false,
      };

      io.in(recipientId).emit('accept_friend_request', recipientObj);
      socket.emit('accept_friend_request', senderObj);

      Object.values(senderConnections).forEach((connection) => {
        connection.socket.join(newConversation.id);
      });

      Object.values(recipientConnections).forEach((connection) => {
        connection.socket.join(newConversation.id);
      });

      io.in(recipientId).emit('add_conversation', convoObj);
      socket.emit('add_conversation', convoObj);
    }

    socket.on('accept_friend_request', async (friendRequestObj) => {
      let recipientId = friendRequestObj.recipientId;
      let recipientUsername = friendRequestObj.recipientUsername;

      friendRequestObj.username = username;
      friendRequestObj.userId = userId;

      const request = await friendController.acceptFriendRequest(
        friendRequestObj
      );
      if (request && request.friendship.status === 'accepted') {
        const { friendship, newConversation } = request;

        let senderObj = {
          conversationId: newConversation?.id,
          friend: {
            id: recipientId,
            username: recipientUsername,
          },
          requestInfo: {
            id: friendship.id,
            status: friendship.status,
          },
        };

        let recipientObj = {
          conversationId: newConversation?.id,
          friend: {
            id: userId,
            username,
          },
          requestInfo: {
            id: friendship.id,
            status: friendship.status,
          },
        };

        handleAcceptFriendRequest(recipientObj, senderObj, request);
      }

      return request;
    });

    socket.on('decline_friend_request', async (friendRequestObj) => {
      // console.log('-----deny_friend_request------');
      // console.log('----------------------');

      let recipientId = friendRequestObj.recipientId;
      let recipientUsername = friendRequestObj.recipientUsername;

      // console.log('sender | ', username, userId);
      // console.log('recip | ', recipientUsername, recipientId);

      // console.log(friendRequestObj);

      const request = await friendController.declineFriendRequest({
        userId,
        recipientId,
      });
      if (request && request.status === 'rejected') {
        let senderObj = {
          friend: {
            id: recipientId,
            username: recipientUsername,
          },
          requestInfo: {
            id: request.id,
            status: request.status,
          },
        };

        let recipientObj = {
          friend: {
            id: userId,
            username,
          },
          requestInfo: {
            id: request.id,
            status: request.status,
          },
        };

        io.in(recipientId).emit('deny_friend_request', recipientObj);
        socket.emit('deny_friend_request', senderObj);
      }

      return request;
    });

    socket.on('cancel_friend_request', async (friendRequestObj) => {
      // console.log('-----cancel_friend_request------');
      // console.log('----------------------');

      let recipientId = friendRequestObj.recipientId;
      let friendshipId = friendRequestObj.friendshipId;

      // console.log('sender | ', username, userId);
      // console.log('recip | ', recipientId);

      // console.log(friendRequestObj);

      const request = await friendController.cancelFriendRequest({
        friendshipId,
      });
      if (request) {
        let senderObj = {
          friend: {
            id: recipientId,
          },
          requestInfo: {
            id: request.id,
            status: request.status,
          },
        };

        let recipientObj = {
          friend: {
            id: userId,
            username,
          },
          requestInfo: {
            id: request.id,
            status: request.status,
          },
        };

        io.in(recipientId).emit('deny_friend_request', recipientObj);
        socket.emit('deny_friend_request', senderObj);
      }

      return request;
    });

    socket.on('remove_friend', async (friendObj) => {
      // console.log('-----remove_friend------');
      // console.log('----------------------');
      // console.log(friendObj);

      let friendshipId = friendObj.id;
      let friendId = friendObj.friendId;
      let conversationId = friendObj.conversationId;

      // console.log('friendshipId | ', friendshipId);
      // console.log('friendId | ', friendId);

      await friendController.removeFriend(userId, friendObj);

      socket.emit('friend_removed', friendObj);
      friendObj.friendId = userId;
      io.in(friendId).emit('friend_removed', friendObj);
    });

    // Broadcast message to specific room
    socket.on('message', async (messageObj) => {
      const { conversationId, content } = messageObj;
      let room = conversationId;

      const newMessage = await chatController.createMessage(messageObj, userId);
      if (!newMessage) return false;

      newMessageObj = {
        createdAt: Date.now(),
        conversationId,
        content: newMessage.content,
        id: newMessage.id,
        userId,
        username,
      };

      // console.log(newMessageObj);

      if (rooms[room]) {
        rooms[room].messages.push(newMessageObj);
      }

      io.in(room).emit('new_message', newMessageObj);
    });

    // Edit message in specific room
    socket.on('edit_message', async (messageObj) => {
      const { conversationId, messageId, newContent } = messageObj;

      let room = conversationId;
      await chatController.editMessage(messageObj, userId);

      io.in(room).emit('edit_message', messageObj);
    });

    // Edit message in specific room
    socket.on('delete_message', async (messageObj) => {
      const { conversationId, messageId } = messageObj;
      let room = conversationId;
      await chatController.deleteMessage(messageObj, userId);

      io.in(room).emit('delete_message', messageObj);
    });

    // Edit message in specific room
    socket.on('change_chatname', async (changeObj) => {
      const { conversationId } = changeObj;
      let room = conversationId;
      let changeChatNameRequest = await chatController.changeChatName(
        changeObj
      );
      if (changeChatNameRequest) {
        io.in(room).emit('change_chatname', changeObj);
      }
    });

    // Edit message in specific room
    socket.on('start_conversation', async (convoObj) => {
      const { friendListIds, friendListNames } = convoObj;
      let newConversation = await chatController.startConversation(
        convoObj,
        userId,
        username
      );

      if (newConversation) {
        friendListIds.map((id) => {
          let recipientConnections = connections[id];

          if (recipientConnections) {
            Object.values(recipientConnections).forEach((connection) => {
              connection.socket.join(newConversation.id);
              connection.socket.emit('add_conversation', newConversation);
            });
          }
        });
        socket.emit('add_conversation', newConversation);
        socket.emit('go_to_conversation', newConversation);
        socket.join(newConversation.id);

        let content;

        content = `${username} has started a new conversation!`;
        emitCustomMessage({ conversationId: newConversation.id, content });

        if (friendListNames.length === 1) {
          content = `${friendListNames[0]} has been added to the conversation!`;
        } else if (friendListNames.length === 2) {
          content = `${friendListNames[0]} and ${friendListNames[1]} have been added to the conversation!`;
        } else {
          let lastFriend = friendListNames.pop();
          content = `${friendListNames.join(
            ', '
          )}, and ${lastFriend} have been added to the conversation!`;
        }

        emitCustomMessage({ conversationId: newConversation.id, content });
      }
    });

    // Edit message in specific room
    socket.on('leave_conversation', async (leaveObj) => {
      const { conversationId } = leaveObj;
      let leaveConversation = await chatController.leaveConversation(
        conversationId,
        userId
      );
      if (leaveConversation) {
        let currentConnections = connections[userId];

        Object.values(currentConnections).forEach((connection) => {
          connection.socket.leave(conversationId);
        });

        socket.emit('remove_conversation', leaveObj);

        content = `${username} has left the conversation!`;
        emitCustomMessage({ conversationId, content });

        io.in(conversationId).emit('user_left_conversation', {
          conversationId,
          userId,
        });
      }
    });

    // Edit message in specific room
    socket.on('add_friends_to_conversation', async (convoObj) => {
      const { friendListIds, friendListNames } = convoObj;

      let room = convoObj.conversationId;
      let conversation = await chatController.addFriendsToConversation(
        convoObj
      );

      if (conversation) {
        io.in(room).emit('user_joined_conversation', convoObj);

        friendListIds.map((id) => {
          let recipientConnections = connections[id];

          if (recipientConnections) {
            Object.values(recipientConnections).forEach((connection) => {
              connection.socket.join(conversation.id);
              connection.socket.emit('add_conversation', conversation);
            });
          }
        });

        let content;
        if (friendListNames.length === 1) {
          content = `${username} has added ${friendListNames[0]} to the conversation!`;
        } else if (friendListNames.length === 2) {
          content = `${username} has added ${friendListNames[0]} and ${friendListNames[1]} to the conversation!`;
        } else {
          let lastFriend = friendListNames.pop();
          content = `${username} has added ${friendListNames.join(
            ', '
          )}, and ${lastFriend} to the conversation!`;
        }

        emitCustomMessage({ conversationId: conversation.id, content });
      }
    });

  });
};
