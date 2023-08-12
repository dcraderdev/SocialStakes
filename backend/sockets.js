const { gameController } = require('./controllers/gameController');
const { chatController } = require('./controllers/chatController');
const { friendController } = require('./controllers/friendController');
const { cardConverter } = require('./controllers/cardConverter');
const {
  drawCards,
  handSummary,
  bestValue,
} = require('./controllers/cardController');

module.exports = function (io) {

  const connections = {}

  const rooms = {};
  const disconnectTimeouts = {};
  let disconnectTimes = {};

  const roomInit = () => {
    return {
      seats: {},
      roundId: null,
      actionSeat: null,
      countdownEnd: null,
      actionEnd: null,
      handInProgress: false,
      gameSessionId: null,
      serverSeed: null,
      nonce: 1,
      deck: null,
      cursor: 0,
      dealerCards: {
        naturalBlackjack: false,
        hiddenCards: [],
        visibleCards: [],
        otherCards: [],
        handSummary: null,
        bestValue: null,
      }, 
      messages: [],
      conversationId: null,
      sortedActivePlayers: [],
      sortedFinishedPlayers: [],
      forfeitedPlayers: [],
      insuredPlayers: {},
    };
  }; 








  io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId;
    const username = socket.handshake.query.username;

    let socketId = socket.id;
 
    socket.join(userId);

    const userTables = await gameController.getUserTables(userId);
    const userFriends = await friendController.getUserFriends(userId);
    const userConversations = await chatController.getUserConversations(userId);

    // console.log('-=-=-=-=-=-=-=-=-=');
    // console.log('--- CONNECTING ---');
    // console.log('SOCKET ID', socketId);
    // console.log('A user connected', socket.id, 'Username:', username);
    // console.log('User Room:', userId);
    // console.log('userConversations:');
    // console.log(userConversations);
 
    // console.log('-=-=-=-=-=-=-=-=-=');


    if(!connections[userId]){
      connections[userId] = {}
    }

    connections[userId][socketId] = {
      socket: socket,
      status: 'connected',
      connectedAt: Date.now(),
      timeOfLastAction: Date.now()
    }

    if(userConversations){
      Object.keys(userConversations).map(conversation=>{
        socket.join(conversation)
      })
    } 


    let initObj = {
      userFriends,
      userConversations
    } 

    socket.emit('initialize_user', initObj);

    // dispatch(friendActions.getUserFriends())
    // dispatch(chatActions.getUserConversations())

    // Reconnection logic
    if (disconnectTimeouts[userId]) {
      clearTimeout(disconnectTimeouts[userId]);
      // console.log(`User ${username} reconnected, timeout cleared.`);
      delete disconnectTimeouts[userId];
      delete disconnectTimes[userId]

      if (userTables) {
        for (let table of userTables) {
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

          // io.in(tableId).emit('new_message', messageObj);
          io.in(tableId).emit('player_reconnected', { seat, tableId, timer });
        }
      }
    }

    socket.on('disconnect_user', async () => {
      const userTables = await gameController.getUserTables(userId);
      if (userTables) {
        for (let table of userTables) {
          handleDisconnect(table);
        }
      }
      await gameController.removeUserFromTables(userId)
    });

    async function handleDisconnect(playerSeatObj) {
      // console.log('-------handleDisconnect-------');
      // console.log('--------------');

      let tableId = playerSeatObj.tableId;
      let userTableId = playerSeatObj.id;
      let userId = playerSeatObj.userId;
      let seat = playerSeatObj.seat;
      let room = tableId;


      if (rooms[tableId] && rooms[tableId].seats[seat]) {
        let player = rooms[tableId].seats[seat];
        let anyPlayersAfter = rooms[tableId].sortedActivePlayers.some(player => player.seat < seat );
        let anyPlayersBefore = rooms[tableId].sortedActivePlayers.some(player => player.seat > seat );
        let leaveOnPlayerTurn = rooms[tableId].actionSeat === player.seat
        let handInProgress = rooms[tableId].handInProgress;
        let leaveSeatObj = {
          tableId,
          seat,
          userTableId,
          userId,
          tableBalance: player.tableBalance,
        }; 

        // If the user disconnects during a hand, add them to the forfeited players and update our hand's status
        if (handInProgress) {
          
          let playerHands = Object.entries(player.hands);
          for (let [key, handData] of playerHands) {
            handData.turnEnded = true;
          }
          rooms[tableId].forfeitedPlayers.push( player );
          player.forfeit = true
          clearTimeout(disconnectTimeouts[userId])
          delete disconnectTimeouts[userId];
          delete disconnectTimes[userId]
      
          let currentTimer = rooms[tableId].actionEnd
          let leaveSeatObj = {tableId, seat, currentTimer}

          io.to(room).emit('player_forfeit', leaveSeatObj)

          //if no players left to act, end the round
          if (!anyPlayersBefore && !anyPlayersAfter) {
            await endRound(tableId, io);
            return
          }
          
          if(leaveOnPlayerTurn){
            clearInterval(rooms[tableId].timerId)
            await gameLoop(tableId, io);
            return
          }
           
        } else {

          // Refund pending bet(if exists) for user
          player.tableBalance += rooms[tableId].seats[seat].pendingBet;
          rooms[tableId].seats[seat].pendingBet = 0;
          leaveSeatObj.tableBalance = player.tableBalance;

          // Remove the player from the room state
          if (rooms[tableId] && rooms[tableId].seats[seat]) {
            delete rooms[tableId].seats[seat];
          }

          const leaveSeat = await gameController.leaveSeat(leaveSeatObj);
          // const leaveSeat = await gameController.removeUserFromTables(userId)
          if (!leaveSeat) return;
          emitUpdatedTable(tableId, io);
          io.in(userId).emit('player_leave', leaveSeatObj);

          // if theres other bets continue timer, otherwise cancel
          if (isNoBetsLeft(tableId)) {
            stopTimer(tableId);
          }
        }
      }
    }



    //takes in the function we want to emit and the object we will be emitting
    // has optional userId field in case function is not directed at currentUser
    async function handleEmit(cb, updateObj, targetUserId = userId) {
      let currentConnections = connections[targetUserId];

      Object.values(currentConnections).forEach(connection => {
        connection.socket.emit(cb, updateObj);
      });
    }

  

    async function handleJoin(room, targetUserId = userId) {
      let currentConnections = connections[targetUserId];

      Object.values(currentConnections).forEach(connection => {
        connection.socket.join(room);
      });
    }

    async function fetchUpdatedTable(tableId){

      let updatedTable = await gameController.getTableById(tableId);
      if(!updatedTable) return

      if (!rooms[tableId]) {
        rooms[tableId] = roomInit();
        rooms[tableId].gameSessionId = updatedTable.gameSessions[0].id;
        rooms[tableId].blockHash = updatedTable.gameSessions[0].blockHash;
        rooms[tableId].decksUsed = updatedTable.Game.decksUsed;
        rooms[tableId].shufflePoint = updatedTable.shufflePoint;
        rooms[tableId].conversationId = updatedTable.Conversation.id;
        rooms[tableId].chatName = updatedTable.Conversation.chatName;
      }

      return updatedTable

    }
 


    socket.on('disconnect', async () => {

      let timer = 10000; // 15 seconds

      disconnectTimes[userId] = Date.now();


      // Clear the existing timeout for this user (if any)
      if (disconnectTimeouts[userId]) {
        clearTimeout(disconnectTimeouts[userId]);
      }

      // Start a new timeout for this user
      disconnectTimeouts[userId] = setTimeout(async () => {

        // Check the elapsed time since disconnect
        let elapsedSeconds = Math.floor((Date.now() - disconnectTimes[userId]) / 1000);
        if (elapsedSeconds < timer / 1000) {
          return;
        }
        const userTables = await gameController.getUserTables(userId);
        if (userTables) {
          for (let table of userTables) {
            let tableId = table.tableId
            let messageObj = {
              tableId,
              user: { username: 'Room', id: 1, rank: 0 },
              message: {
                content: `${username} has disconnected.`,
                id: 0,
              },
            };
     
            // io.in(tableId).emit('new_message', messageObj);
            handleDisconnect(table);
            socket.leave(tableId)
          }
        }
      }, timer);
    }); 



    socket.on('join_room', async (tableId) => {

      let updatedTable = await fetchUpdatedTable(tableId)
      if(!updatedTable) return

      let updateObj = {
        tableId,
        table: {
          actionSeat: rooms[tableId].actionSeat,
          countdownEnd: rooms[tableId].countdownEnd,
          actionEnd: rooms[tableId].actionEnd,
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
 
      let conversationId = rooms[tableId].conversationId
      let content = `${username} has joined the room.`

      // socket.join(conversationId);
      // socket.join(tableId);
      handleJoin(conversationId)
      handleJoin(tableId)
      
      await emitCustomMessage({ conversationId, content, tableId })



      let tableConvoId = updatedTable?.Conversation?.id

      
      handleEmit('join_table', updatedTable)
      socket.emit('view_table', { id: tableId, conversationId: tableConvoId })
      handleEmit('get_updated_table', updateObj)
      
      // socket.emit('join_table', updatedTable);
      // socket.emit('get_updated_table', updateObj);

    });

 
    socket.on('update_table_name', async (updateObj) => {
      const { tableId, tableName } = updateObj;
      if(!tableId || !tableName) return
      let content = `${username} has updated the table name to ${tableName}.`
      let conversationId = rooms?.[tableId]?.conversationId

      await emitCustomMessage({ conversationId, content, tableId })
      io.in(conversationId).emit('update_table_name', updateObj);
    });


    socket.on('view_room', async (tableId) => {
      let conversationId = rooms?.[tableId]?.conversationId
      let table = { id: tableId, conversationId };
      socket.emit('view_table', table);
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
        handleEmit('player_leave',leaveSeatObj, userId)
        return;
      });

      await Promise.all(leaveSeatPromises);
      await gameController.closeTable(tableId);

      delete rooms[tableId];
      io.to(room).emit('close_table', tableId)


      // // Get the connected sockets in the room
      // let sockets = rooms[tableId].connections || {}
      // console.log(sockets);

      // // Disconnect all sockets in the room
      // for (const [userId, socketInfo] in sockets) {
      //   console.log(userId);
      //   console.log(socketInfo);
      //   // (socketId).disconnect();
      // }


      // console.log('--- close_table ---');
      // console.log(`${username} close_table ${room}.`);
      // console.log('-=-=-=-=-=-=-=-=-=');
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
        insurance:{
          accepted:false,
          bet: 0
        }
      };

      // If the room doesnt exist create a new room
      if (!rooms[tableId]) {
        let updatedTable = await gameController.getTableById(tableId);
        rooms[tableId] = roomInit();
        rooms[tableId].gameSessionId = updatedTable.gameSessions[0].id;
        rooms[tableId].decksUsed = updatedTable.Game.decksUsed;
      } 

      // Add the player to the room
      rooms[tableId].seats[seat] = takeSeatObj;
 

      let content = `${username} has taken seat ${seat}.`
      let conversationId = rooms?.[tableId]?.conversationId

      await emitCustomMessage({ conversationId, content, tableId })

      // io.in(room).emit('new_message', messageObj);
      io.in(room).emit('new_player', takeSeatObj);

      // console.log('--------------');
      // console.log(`${username} taking seat${seat} in ${room}`);
      // console.log('--------------');
    });
 
    socket.on('leave_seat', async (seatObj) => {
      // console.log('--------------');
      // console.log(`leave_seat`);
      // console.log('--------------');
      const { tableId, seat } = seatObj;
      if (rooms[tableId] && rooms[tableId].seats[seat]) {
        let player = rooms[tableId].seats[seat];
        await handleDisconnect(player)
      }
    });


    socket.on('leave_table', async (seatObj) => {
      // console.log('--------------');
      // console.log(`leave_table`);
      // console.log('--------------');
      const { tableId, seat } = seatObj;
      if (rooms[tableId] && rooms[tableId].seats[seat]) {
        let player = rooms[tableId].seats[seat];
        socket.leave(tableId);
        await handleDisconnect(player)
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

      if (isNoBetsLeft(tableId)) {
        stopTimer(tableId);
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

      if (isNoBetsLeft(tableId)) {
        stopTimer(tableId);
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
        return
      }
    
      // Update pendingBet in the rooms object
      if (rooms[tableId] && rooms[tableId].seats[seat]) {
        rooms[tableId].seats[seat].pendingBet += bet;
        rooms[tableId].seats[seat].tableBalance -= bet;
      }

      if(!rooms[tableId].countdownEnd){
        setDealCountdownEndTime(tableId, io)
      }
  
    
      io.in(room).emit('new_bet', betObj);
    });
    


    // Check for expired countdowns every second
    setInterval(async () => {
      for (const tableId in rooms) {
        const room = rooms[tableId];
        if (room.countdownEnd && Date.now() >= room.countdownEnd) {
          room.countdownEnd = null;
    
          // if theres bets, start hand otherwise cancel
          if (isNoBetsLeft(tableId)) {
            stopTimer(tableId);
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
            countdownEnd: room.countdownEnd,
            tableId,
          };
          io.in(tableId).emit('collect_bets', countdownObj);
          dealCards(tableId, io);
        }
      }
    }, 1000);
    

    async function setDealCountdownEndTime(tableId, io){

      if(!rooms[tableId]) return
      if(rooms[tableId].countdownEnd) return

      let room = tableId
      // Set countdown end time
      const countdownDuration = 10000; // 5 seconds
      const endTime = Math.ceil((Date.now() + countdownDuration));
      rooms[tableId].countdownEnd = endTime;

      let countdownObj = {
        countdownEnd: endTime,
        tableId,
      };

      io.in(room).emit('countdown_update', countdownObj);
    }

    function isNoBetsLeft(tableId) {
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

    function stopTimer(tableId) {
      let room = tableId;
      let countdownObj = { countdownEnd: 0, tableId };

      rooms[tableId].countdownEnd = null;
      io.in(room).emit('countdown_update', countdownObj);
    }


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

      emitUpdatedTable(tableId, io);

      // console.log('--------------');
      // console.log(
      //   `Insurance accepted(${insuranceCost}) for ${username} @room ${room}`
      // );
      // console.log('--------------');
    }); 

    // starts game of blackjack for multiple players
    async function dealCards(tableId, io) {
      // console.log('------- DEALING CARDS -------');
      let room = tableId;

      let dealObj = {
        tableId,
        gameSessionId: rooms[tableId].gameSessionId,
        blockHash: rooms[tableId].blockHash,
        nonce: rooms[tableId].nonce,
        decksUsed: rooms[tableId].decksUsed,
      };

      let roundId, deck;

      // console.log('------- dealObj -------');
      // console.log(dealObj);
      // console.log('------------------------');

      // if no deck or deck cursor is past shuffle point
      // increment nonce and create new deck
      if (
        rooms[tableId].cursor >= rooms[tableId].shufflePoint ||
        !rooms[tableId].deck
      ) {
        // generate cards and create Round entry in db
        dealObj.nonce++;
        rooms[tableId].nonce++;

        const deckandRoundId = await gameController.dealCards(dealObj);
        if (!deckandRoundId) {
          return;
        }
        deck = deckandRoundId.deck;
        roundId = deckandRoundId.roundId;
        // Assign deck and roundId to room
        rooms[tableId].deck = deck;
        rooms[tableId].roundId = roundId;
        rooms[tableId].cursor = 0;
      } else {
        deck = rooms[tableId].deck;
        roundId = await gameController.newRound(dealObj);
        rooms[tableId].roundId = roundId;
      } 

      // Calculate number of cards to draw
      // numSeats with currentBets + cards for dealer
      // Sort the seats by seat number and only include those with a current bet
      let sortedSeats = Object.entries(rooms[tableId].seats)
        .filter(([i, seat]) => seat.currentBet > 0)
        .sort(([seatNumberA], [seatNumberB]) => seatNumberA - seatNumberB)
        .map(([i, seat]) => seat);

      // Set sorted seats for gameLoop
      rooms[tableId].sortedActivePlayers = sortedSeats;

      // console.log('------- sortedSeats -------');
      // console.log(sortedSeats);
      // console.log('------------------------');

      let userTableIds = sortedSeats.map((seat) => seat.id);

      // console.log('------- ROUND ID -------');
      // console.log(userTableIds);
      // console.log(roundId);
      // console.log('------------------------');

      // Create hand for each active player
      const handIds = await gameController.createHands(userTableIds, roundId);
      let numSeatsWithBets = sortedSeats.length + 1;
      let cardsToDraw = numSeatsWithBets * 2;
      let cursor = rooms[tableId].cursor;

      let drawObj = {
        deck,
        cardsToDraw,
        cursor,
      };
      const drawnCardsAndDeck = drawCards(drawObj);
      const { drawnCards, newDeck } = drawnCardsAndDeck;

      // console.log('------- newDeck -------');
      // console.log(newDeck);
      // console.log('------------------------');

      // console.log('------- drawnCards -------');
      // console.log(drawnCards);
      // console.log('------------------------');

      rooms[tableId].deck = newDeck;

      if (handIds && drawnCards) {
        // Distribute the cards
        for (let j = 0; j < 2; j++) {
          for (let i = 0; i < sortedSeats.length; i++) {
            let seat = sortedSeats[i];
            // Get the next card and remove it from the drawnCards array
            let nextCard = drawnCards.shift();
            let modCard = nextCard % 51;
            seat.cards.push(modCard);
            // Create a newHand inside the handsObj in case we need to split during the hand
            // Use the map we created to get the handIds
            if (!seat.hands[`${handIds[i]}`]) {
              seat.hands[`${handIds[i]}`] = {
                cards: [],
                bet: null,
                turnEnded: false,
                summary: null,
              };
            }
            seat.hands[`${handIds[i]}`].cards.push(modCard);
            seat.hands[`${handIds[i]}`].bet = seat.currentBet;
          }
          // Distribute the cards to the dealer
          let nextCard = drawnCards.shift();
          let modCard = nextCard % 51;
          // console.log('------- modCard -------');
          // console.log(modCard);
          // console.log('------------------------');
          if (j === 1) {
            rooms[tableId].dealerCards.hiddenCards.push(modCard);
          } else {
            rooms[tableId].dealerCards.visibleCards.push(modCard);
          }
        }
      }

      // Set new cursor point, setDealers cards
      rooms[tableId].cursor += cardsToDraw;

      // console.log('_*_*_*_*_*_*_*_*_*_*_*_**_');
      // console.log('_*_*_*_*_*_*_*_*_*_*_*_**_');
      // console.log('cardsToDraw:', cardsToDraw);
      // console.log('NEW CURSOR:', rooms[tableId].cursor);
      // console.log('_*_*_*_*_*_*_*_*_*_*_*_**_');
      // console.log('_*_*_*_*_*_*_*_*_*_*_*_**_');

      let updateObj = {
        tableId,
        table: {
          seats: rooms[tableId].seats,
          dealerCards: {
            visibleCards: rooms[tableId].dealerCards.visibleCards,
          },
        },
      };
      io.in(room).emit('get_updated_table', updateObj);

      // console.log('------- dealer cards -------');
      // console.log(rooms[tableId].dealerCards.visibleCards[0]);
      // console.log(rooms[tableId].dealerCards.hiddenCards[0]);
      // console.log('------- ------------ -------');

      let dealerVisibleCard = rooms[tableId].dealerCards.visibleCards[0];
      let dealerHiddenCard = rooms[tableId].dealerCards.hiddenCards[0];


      // Check dealers hand strength 
      let dealerCards = rooms[tableId].dealerCards;
      let dealerHand = await handSummary([dealerVisibleCard,dealerHiddenCard]);
      let bestDealerValue = await bestValue(dealerHand.values);
      rooms[tableId].dealerCards.handSummary = dealerHand;
      rooms[tableId].dealerCards.bestValue = bestDealerValue;

      // console.log(rooms[tableId].dealerCards);

      let isAce = cardConverter[dealerVisibleCard].value === 11;
 
      if (isAce) {

        // socket.emit('offer_insurance', tableId);

        io.in(room).emit('offer_insurance', tableId);

        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 10 seconds
        // socket.emit('remove_insurance_offer', tableId);

        io.in(room).emit('remove_insurance_offer', tableId);

      }

      // if dealer has blackjack, skip to end of round
      if (bestDealerValue === 21) {
        await handleDealerBlackjack(tableId);

        await endRound(tableId, io);
      } else {
        await gameLoop(tableId, io);
      }
    }

    async function handleDealerBlackjack(tableId) {
      let room = tableId;
      let dealerCards = rooms[tableId].dealerCards;
      let visibleCards = dealerCards.visibleCards;
      let hiddenCards = dealerCards.hiddenCards;
      let otherCards = dealerCards.otherCards;

      // Combine all dealer's cards
      let newCards = [...visibleCards, ...hiddenCards, ...otherCards];
      let dealerHand = await handSummary(newCards);
      let bestDealerValue = await bestValue(dealerHand.values);
      // Assign dealer value for end game processing
      dealerCards.handSummary = dealerHand;
      dealerCards.bestValue = bestDealerValue;
      rooms[tableId].dealerCards.naturalBlackjack = true;

      // Move players to finsihed Array for endGame processing
      rooms[tableId].sortedFinishedPlayers = [
        ...rooms[tableId].sortedActivePlayers,
      ];
      rooms[tableId].sortedActivePlayers = [];
      rooms[tableId].dealerCards.visibleCards = newCards;

      // show the blackjack
      let updateObj = {
        tableId,
        table: {
          actionSeat: null,
          seats: rooms[tableId].seats,
          dealerCards: {
            visibleCards: dealerCards.visibleCards,
          },
        },
      };

      io.in(room).emit('get_updated_table', updateObj);
    }

    async function gameLoop(tableId, io) {
      // console.log('------- GAME LOOP -------');
      // console.log('------- CURSOR -------');
      // console.log('');
      // console.log(rooms[tableId].cursor);
      // console.log('');
      // console.log('----------------------');

      // // Emit latest decision to clients
      emitUpdatedTable(tableId, io);

      // Get next player
      let nextPlayer = getNextPlayer(tableId);

      // If none, handle dealer turn
      if (!nextPlayer) {
        await handleDealerTurn(tableId, io);
        return;
      }

      // If some, handle player turn
      await handlePlayerTurn(tableId, nextPlayer, io);

      // cirlce back into gameLoop
      await gameLoop(tableId, io);
    }

    //returns next player or false if all players have acted
    function getNextPlayer(tableId) {

      let sortedActivePlayers = rooms[tableId].sortedActivePlayers;
      let nextPlayer;
      if (rooms[tableId] && sortedActivePlayers.length) {
        nextPlayer = sortedActivePlayers[sortedActivePlayers.length - 1];
      }
      if (nextPlayer) {
        return nextPlayer;
      } else {
        return false;
      }
    }

 
    async function handlePlayerTurn(tableId, player, io) {
      let room = tableId;

      //Iterate over each player's hand
      let playerHands = Object.entries(player.hands);
      // If all hands are finsihed, move the player to sortedFinishedPlayers
      let allHandsEnded = true;
      for (let [key, handData] of playerHands) {
        if (!handData.turnEnded) {
          allHandsEnded = false;
          break;
        }
      } 
      if (allHandsEnded) {
        let nextPlayer = rooms[tableId].sortedActivePlayers.pop();
        rooms[tableId].sortedFinishedPlayers.push(nextPlayer);
        return;
      }

      for (let [key, handData] of playerHands) {
        if (handData.turnEnded) continue;

        let cards = handData.cards;
        // console.log('------- cards -------');
        // console.log('');
        // console.log(cards);
        // console.log(player);
        // console.log('');
        // console.log('----------------------');
        if(cards.length ===1){
          await playerHit({ tableId, seat:player.seat, handId:key })
          return
        }
        let playerHand = await handSummary(cards);
        let playerBestValue = await bestValue(playerHand.values);
        // Assign handSummary to hand
        handData.summary = playerHand; 
 
        if ( 
          playerHand.blackjack ||
          playerHand.busted ||
          playerBestValue === 21
        ) { 
          handData.turnEnded = true;
          clearInterval(rooms[tableId].timerId);
          continue;
        }  

        // Create action end timestamp
        const actionDuration = 15000; // 5 seconds
        rooms[tableId].actionEnd = Math.ceil(Date.now() + actionDuration);

        // Set action seat
        rooms[tableId].actionSeat = player.seat;

        // Emit update to clients
        let updateObj = {
          tableId,
          table: {
            actionSeat: player.seat,
            actionHand: key,
            actionEnd: rooms[tableId].actionEnd,
            seats: rooms[tableId].seats,
            dealerCards: {
              visibleCards: rooms[tableId].dealerCards.visibleCards,
            },
          },
        };

        io.in(room).emit('get_updated_table', updateObj);
        // // If timer already exists, return without creating another one
        // if (rooms[tableId].timerId) {
        //   clearInterval(rooms[tableId].timerId)
        // }


        // Create timer and store its id in the room object
        return new Promise((resolve, reject) => {
          rooms[tableId].timerId = setInterval(async () => {
            const remainingTime = Math.ceil((rooms[tableId].actionEnd - Date.now()) / 1000);
      
            // rooms[tableId].actionTimer -= 1000; // Decrement by 1 second
            // console.log('COUNTDOWN: ', rooms[tableId].actionTimer);
            // console.log('COUNTDOWN: ', rooms[tableId].actionTimer);
            // console.log('COUNTDOWN: ', rooms[tableId].actionTimer);
            // console.log('COUNTDOWN: ', rooms[tableId].actionTimer);
            // console.log('COUNTDOWN: ', rooms[tableId].actionTimer);
            // console.log('COUNTDOWN: ', rooms[tableId].actionTimer);
            // If timer reaches 0, clear interval and emit a timeout event
            if (remainingTime <= 0) {
              clearInterval(rooms[tableId].timerId);

              // Set turnEnded to true for this hand
              handData.turnEnded = true;
              resolve(); // Resolve the promise to let the game loop continue
            }
          }, 1000);
        });
      }
      return;
    }
 
 

    socket.on('player_action', async (actionObj) => {
      const { tableId, action, seat, handId } = actionObj;
      let room = tableId;

      // let messageObj = {
      //   tableId,
      //   user: { username: 'Room', id: 1, rank: 0 },
      //   message: {
      //     content: `${username} has ${action}.`,
      //     id: 0,
      //   },
      // }; 
      if(!rooms[tableId]) return

      // Reset the timer whenever a player takes an action
      if (rooms[tableId] && rooms[tableId].timerId) {
        clearInterval(rooms[tableId].timerId);
        rooms[tableId].actionEnd = 0;
      }
 
      let updateObj = {
        tableId,
        table: {
          actionEnd: rooms?.[tableId]?.actionEnd,
          seats: rooms[tableId].seats,
          dealerCards: {
            visibleCards: rooms[tableId].dealerCards.visibleCards,
          },
        }, 
      };  

      io.in(room).emit('get_updated_table', updateObj);
      // io.in(room).emit('new_message', messageObj);

      // console.log('--------------');
      // console.log(`Handling action(${action}) for ${username} @room ${room}`);
      // console.log('--------------');

      if (action === 'hit') {
        await playerHit(actionObj, io);
      }
      if (action === 'stay') {
        await playerStay(actionObj, io);
      }
      if (action === 'double') {
        await playerDouble(actionObj, io);
      }
      if (action === 'split') {
        await playerSplit(actionObj, io);
      }

      await gameLoop(tableId, io);
    });




    async function playerHit(actionObj, io) {
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
    } 
  
    // Handle player stay action
    async function playerStay(actionObj, io) {
      const { tableId, action, seat, handId } = actionObj;

      // Update hand to show no more decisions need to be made for the gameLoop
      let playersHand = rooms[tableId].seats[seat].hands[handId];
      playersHand.turnEnded = true;
      return;
    }
 
    async function playerSplit(actionObj, io) {
      const { tableId, action, seat, handId } = actionObj;
      let room = tableId;
      let userTableId = rooms[tableId].seats[seat].id;
      let roundId = rooms[tableId].roundId;
      let currentSeat = rooms[tableId].seats[seat];

      // Create new hand for the split
      const newHand = await gameController.createHand(userTableId, roundId);
      let newHandId = newHand.id;

      if (!newHand) {
        await gameLoop(tableId, io);
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

      let updateObj = {
        tableId,
        table: {
          seats: rooms[tableId].seats,
        },
      };

      io.in(room).emit('get_updated_table', updateObj);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 2 seconds
      return;
    }

    async function playerDouble(actionObj, io) {
      const { tableId, action, seat, handId } = actionObj;
      let currentSeat = rooms[tableId].seats[seat];
      let currentHand = rooms[tableId].seats[seat].hands[handId];
      let currentBet = rooms[tableId].seats[seat].hands[handId].bet;
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

      // Update hand to show no more decisions need to be made for the gameLoop
      let playersHand = rooms[tableId].seats[seat].hands[handId];
      playersHand.turnEnded = true;
      rooms[tableId].seats[seat].hands[handId] = playersHand;
      return;

      // End players turn
      // rooms[tableId].sortedFinishedPlayers.push(nextPlayer)
    }

    async function handleDealerTurn(tableId, io) {

      let room = tableId;
      let dealerCards = rooms[tableId].dealerCards;
      let visibleCards = dealerCards.visibleCards;
      let hiddenCards = dealerCards.hiddenCards;
      let otherCards = dealerCards.otherCards;

      // Combine all dealer's cards
      let newCards = [...visibleCards, ...hiddenCards, ...otherCards];
      dealerCards.hiddenCards = [];
      dealerCards.visibleCards = newCards;

      // Emit update to clients
      let updateObj = {
        tableId,
        table: {
          actionSeat: null,
          seats: rooms[tableId].seats,
          dealerCards: {
            visibleCards: dealerCards.visibleCards,
          },
        },
      };

      io.in(room).emit('get_updated_table', updateObj);
      await new Promise((resolve) => setTimeout(resolve, 1500));


      // Check if there's at least one player who hasn't busted
      let anyPlayersLeft = rooms[tableId].sortedFinishedPlayers.some((player) =>
        Object.values(player.hands).some(
          (hand) => hand.summary && !hand.summary.busted
        )
      );

      // If all players have busted, end the round without drawing cards
      if (!anyPlayersLeft) {

        await endRound(tableId, io);
        return;
      }

      // Execute dealer's strategy
      let stop = false;
      while (!stop) {
        // Calculate hand summary and best value
        let dealerHand = await handSummary(newCards);
        let bestDealerValue = await bestValue(dealerHand.values);

        // console.log('--------------');
        // console.log(dealerCards.visibleCards);
        // console.log(dealerHand);
        // console.log(bestDealerValue);
        // console.log('dealerHand.softSeventeen', dealerHand.softSeventeen);
        // console.log('bestDealerValue', bestDealerValue);
        // console.log('--------------');

        // Stop if dealer's best value is 17 or more and the hand is not a soft seventeen
        if (bestDealerValue >= 17 && !dealerHand.softSeventeen) {
          dealerCards.handSummary = dealerHand;
          dealerCards.bestValue = bestDealerValue;
          stop = true;
          continue;
        }


        // Draw a card if dealer's best value is 16 or less, or the hand is a soft seventeen
        // console.log('dealerHand.softSeventeen', dealerHand.softSeventeen);
        // console.log('bestDealerValue', bestDealerValue);

        let cardsToDraw = 1;
        let drawObj = {
          deck: rooms[tableId].deck,
          cardsToDraw,
          cursor: rooms[tableId].cursor,
        };

        let { drawnCards, newDeck } = drawCards(drawObj);



        // console.log('------- newDeck dealer -------');
        // console.log(newDeck);
        // console.log('------------------------');

        rooms[tableId].deck = newDeck;
        newCards.push(...drawnCards);
        dealerCards.visibleCards = newCards; // Update the visible cards

        // Set new cursor point
        rooms[tableId].cursor++;

        // Emit update to clients
        let updateObj = {
          tableId,
          table: {
            actionSeat: null,
            seats: rooms[tableId].seats,
            dealerCards: {
              visibleCards: dealerCards.visibleCards,
            },
          }, 
        };

        io.in(room).emit('get_updated_table', updateObj);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }  
 
      // Dealer's turn is finished, end the round
        await endRound(tableId, io);
    }    
    async function determineResult(
      bestPlayerValue,
      bestDealerValue,
      bet,
      blackjack
    ) { 
      let result;
      let profitLoss;
      let winnings = 0;
 
      if (bestPlayerValue > 21) {
        result = 'LOSE';
        profitLoss = -bet;
      } else if (bestPlayerValue === bestDealerValue) {
        result = 'PUSH';
        profitLoss = 0;
        winnings = bet;
      } else if (blackjack) {
        result = 'BLACKJACK';
        profitLoss = bet * 1.5;
        winnings = bet * 2.5;
      } else if (bestDealerValue > 21 || bestPlayerValue > bestDealerValue) {
        result = 'WIN';
        profitLoss = bet;
        winnings = bet * 2;
      } else {
        result = 'LOSE';
        profitLoss = -bet;
      }

      // Round up winnings
      winnings = Math.ceil(winnings);
      profitLoss = Math.ceil(profitLoss);

      return {
        result,
        profitLoss,
        winnings,
      };
    }

    async function processForfeitedPlayers(tableId, io) {

      let bestDealerValue = rooms[tableId].dealerCards.bestValue;
      let room = tableId;

      if (rooms[tableId] && rooms[tableId].forfeitedPlayers) {
        let forfeitedPlayers = rooms[tableId].forfeitedPlayers;
        for (let player of forfeitedPlayers) {

          let { totalWinnings } = await calculateAndSavePlayerHand(
            player,
            bestDealerValue,
            tableId,
            io
          );

          updateAndClearPlayerData(player, totalWinnings, tableId);

          const { userId, seat } = player;
          let userTableId = player.id;
          let tableBalance = player.tableBalance;

          // Remove the player from the room state
          if (rooms[tableId] && rooms[tableId]?.seats?.[seat]) {
            delete rooms[tableId].seats[seat];
          }

          let leaveSeatObj = {
            tableId,
            seat,
            userTableId,
            userId,
            tableBalance,
          };
          emitUpdatedTable(tableId, io);

          await gameController.leaveSeat(leaveSeatObj);
          // io.in(room).emit('player_leave', leaveSeatObj);
          io.in(userId).emit('player_leave', leaveSeatObj);
          // socket.leave(room);
        }
      } 
    }

    function updateAndClearPlayerData(player, totalWinnings, tableId) {
      player.tableBalance += totalWinnings;
      player.hands = {};
      player.cards = [];
      player.pendingBet = 0;
      player.currentBet = 0;
      player.insurance= {
        accepted:false,
        bet: 0
      }
    }
 
    async function calculateAndSavePlayerHand(
      player,
      bestDealerValue,
      tableId,
      io
    ) {

      let room = tableId;
      let totalWinnings = 0;
      let totalProfitLoss = 0;

      let playerHands = Object.entries(player.hands);
      for (let [key, handData] of playerHands) {
        let { cards, bet } = handData;
        let playerHand = await handSummary(cards);
        let bestPlayerValue = await bestValue(playerHand.values);

        // Determine the result of any insurance
        const { insuranceWinnings, insuranceProfitLoss, hasInsuranceBet } =
          handleInsurancePayout(tableId, player.seat);

        // Determine the result of the hand
        const { result, profitLoss, winnings } = await determineResult(
          bestPlayerValue,
          bestDealerValue,
          bet,
          playerHand.blackjack
        );
 
        totalWinnings += winnings;
        totalWinnings += insuranceWinnings;

        totalProfitLoss += profitLoss;
        totalProfitLoss += insuranceProfitLoss;

        let handObj = {
          handId: key,
          userTableId: player.id,
          cards: JSON.stringify(cards),
          result,
          totalProfitLoss,
          hasInsuranceBet,
        };

        // Save the results
        await gameController.savePlayerHand(handObj);

        //Update the hands bet to show profit/loss
        if (rooms[tableId]?.seats?.[player.seat]?.hands?.[key]?.bet) {
          rooms[tableId].seats[player.seat].hands[key].bet += profitLoss;
        }
        // Display winnings or losses of each bet
        let updateObj = {
          tableId,
          table: {
            seats: rooms[tableId].seats,
            dealerCards: {
              visibleCards: rooms[tableId].dealerCards.visibleCards,
            },
          },
        };
        io.in(room).emit('get_updated_table', updateObj);
      }

      return {
        totalWinnings,
      };
    }

    function resetRoomForNextHand(tableId) {

      rooms[tableId].dealerCards = {
        naturalBlackjack: false,
        hiddenCards: [],
        visibleCards: [],
        otherCards: [],
        handSummary: null,
        bestValue: null,
      };

      rooms[tableId].forfeitedPlayers = [];
      rooms[tableId].sortedFinishedPlayers = [];
      rooms[tableId].insuredPlayers = {};
      rooms[tableId].handInProgress = false;
      rooms[tableId].actionSeat = null;
      clearInterval(rooms[tableId].timerId);
      rooms[tableId].actionEnd = null;
    }

    function emitUpdatedTable(tableId, io) {
      if (!rooms[tableId]) return;
      let room = tableId;
      let updateObj = {
        tableId,
        table: {
          seats: rooms[tableId].seats,
          dealerCards: {
            visibleCards: rooms[tableId].dealerCards.visibleCards,
          },
        },
      };

      io.in(room).emit('get_updated_table', updateObj);
    }

    function handleInsurancePayout(tableId, seat) {
      let naturalBlackjack = rooms[tableId].dealerCards.naturalBlackjack;
      let bet = rooms[tableId].insuredPlayers[seat];
      let hasInsuranceBet = false;
      let insuranceWinnings = 0;
      let insuranceProfitLoss = 0;

      if (rooms[tableId].insuredPlayers[seat]) {
        hasInsuranceBet = true;
        if (naturalBlackjack) {
          insuranceWinnings = bet * 2;
          insuranceProfitLoss = bet;
        } else {
          insuranceWinnings = 0;
          insuranceProfitLoss = -bet;
        }
      }
      return { insuranceWinnings, insuranceProfitLoss, hasInsuranceBet };
    }

    async function endRound(tableId, io) {


      let room = tableId;
      let bestDealerValue = rooms[tableId].dealerCards.bestValue;
      let finishedPlayers = rooms[tableId].sortedFinishedPlayers;

      stopTimer(tableId);
      // Update table with latest info before ending the round
      emitUpdatedTable(tableId, io);

      if (!finishedPlayers.length) {
        // Do something
      }

      // Iterate over each player and keep track of any winnings
      for (let player of finishedPlayers) {
        // Calculate and save player hand results

        // console.log('------- player -------');
        // console.log(player);
        // console.log('----------------------');

        let { totalWinnings } = await calculateAndSavePlayerHand(
          player,
          bestDealerValue,
          tableId,
          io
        );

        // console.log('------- totalWinnings -------');
        // console.log(totalWinnings);
        // console.log('----------------------');

        // Update and clear player data
        updateAndClearPlayerData(player, totalWinnings, tableId);

        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Display any winnings going to tableBalance
        emitUpdatedTable(tableId, io);
      }

      // Save dealer's cards to db and reset the room for the next hand
      let dealerCards = rooms[tableId].dealerCards;
      let visibleCards = dealerCards.visibleCards;
      let hiddenCards = dealerCards.hiddenCards;
      let otherCards = dealerCards.otherCards;


      // Combine all dealer's cards
      let dealersCards = [...visibleCards, ...hiddenCards, ...otherCards].flat(5);
      // let dealersCards = rooms[tableId].dealerCards.visibleCards.flat(5);


      let handObj = {
        id: rooms[tableId]?.roundId,
        cards: JSON.stringify(dealersCards),
        active: false,
        nonce: rooms[tableId].nonce,
      };

      await gameController.saveDealerHand(handObj);

      // Check for any players that have left midgame and remove them
      await processForfeitedPlayers(tableId, io);

      resetRoomForNextHand(tableId);

      // Emit updated table state one last time
      let updateObj = {
        tableId,
        table: {
          handInProgress: false,
          seats: rooms[tableId].seats,
          dealerCards: {
            visibleCards: rooms[tableId].dealerCards.visibleCards,
          },
        },
      };

      io.in(room).emit('get_updated_table', updateObj);

    }
  

    socket.on('send_friend_request', async (friendRequestObj) => {

      let recipientId = friendRequestObj.recipientId
      let recipientUsername = friendRequestObj.recipientUsername
      
      friendRequestObj.username = username
      friendRequestObj.userId = userId

      const request = await friendController.sendFriendRequest(friendRequestObj);

      
      if(request){

        const {friendship, newConversation} = request


        let senderObj = {
          conversationId: newConversation?.id,
          friend:{ 
            id: recipientId,
            username:recipientUsername,
          },
          requestInfo: { 
            id: friendship.id,
            status: friendship.status
          },
        }
           
 
        let recipientObj = {
          conversationId: newConversation?.id,
          friend:{
            id: userId,
            username,
          },
          requestInfo: {
            id: friendship.id,
            status: friendship.status
          },
           
        }


        if(friendship.status === 'accepted'){
          handleAcceptFriendRequest(recipientObj, senderObj, request)
        }

        if(friendship.status === 'rejected'){
          senderObj.status = 'pending'
          socket.emit('friend_request_sent', senderObj);
        }

        if(friendship.status === 'pending'){
          io.in(recipientId).emit('friend_request_received', recipientObj);
          socket.emit('friend_request_sent', senderObj);
        }

      }
    });


    function handleAcceptFriendRequest(recipientObj, senderObj, request) { 
      let recipientId = senderObj.friend.id
      let senderConnections = connections[userId];
      let recipientConnections = connections[recipientId];
      const {friendship, newConversation} = request

      let convoObj = {
        isDirectMessage: newConversation.isDirectMessage,
        hasDefaultChatName: newConversation.hasDefaultChatName,
        chatName: newConversation.chatName,
        conversationId : newConversation.id,
        members: newConversation.members,
        messages: [],
        notification: false
      }

      io.in(recipientId).emit('accept_friend_request', recipientObj);
      socket.emit('accept_friend_request', senderObj);
      
      Object.values(senderConnections).forEach(connection => {
        connection.socket.join(newConversation.id);
      });
      
      Object.values(recipientConnections).forEach(connection => {
        connection.socket.join(newConversation.id);
      });
      

      io.in(recipientId).emit('add_conversation', convoObj);
      socket.emit('add_conversation', convoObj);

    }

    socket.on('accept_friend_request', async (friendRequestObj) => {

      let recipientId = friendRequestObj.recipientId
      let recipientUsername = friendRequestObj.recipientUsername
      
      friendRequestObj.username = username
      friendRequestObj.userId = userId


      const request = await friendController.acceptFriendRequest(friendRequestObj);
      if(request && request.friendship.status === 'accepted') {

        const {friendship, newConversation} = request

        let senderObj = {
          conversationId: newConversation?.id,
          friend:{ 
            id: recipientId,
            username:recipientUsername,
          },
          requestInfo: { 
            id: friendship.id,
            status: friendship.status
          },
        }
           

        let recipientObj = {
          conversationId: newConversation?.id,
          friend:{
            id: userId,
            username,
          },
          requestInfo: {
            id: friendship.id,
            status: friendship.status
          },
          
        }


        handleAcceptFriendRequest(recipientObj, senderObj, request)

      }
    
      return request;
    });
    
    socket.on('decline_friend_request', async (friendRequestObj) => {
      // console.log('-----deny_friend_request------');
      // console.log('----------------------');


      let recipientId = friendRequestObj.recipientId
      let recipientUsername = friendRequestObj.recipientUsername
      
 
      // console.log('sender | ', username, userId);
      // console.log('recip | ', recipientUsername, recipientId);

      // console.log(friendRequestObj);


      const request = await friendController.declineFriendRequest({userId, recipientId});
      if(request && request.status === 'rejected') {
    
        let senderObj = {
          friend:{
            id: recipientId, 
            username:recipientUsername,
          },
          requestInfo: {
            id: request.id,
            status: request.status
          }
        }
        

        let recipientObj = {
          friend:{
            id: userId,
            username,
          },
          requestInfo: {
            id: request.id,
            status: request.status
          }
        }
    
        io.in(recipientId).emit('deny_friend_request', recipientObj);
        socket.emit('deny_friend_request', senderObj);
      }
    
      return request;
    });



    socket.on('cancel_friend_request', async (friendRequestObj) => {
      // console.log('-----cancel_friend_request------');
      // console.log('----------------------');


      let recipientId = friendRequestObj.recipientId
      let friendshipId = friendRequestObj.friendshipId
 
      // console.log('sender | ', username, userId);
      // console.log('recip | ', recipientId);

      // console.log(friendRequestObj);


      const request = await friendController.cancelFriendRequest({friendshipId});
      if(request) {

        let senderObj = {
          friend:{
            id: recipientId, 
          },
          requestInfo: {
            id: request.id,
            status: request.status
          }
        }
         

        let recipientObj = {
          friend:{
            id: userId,
            username,
          },
          requestInfo: {
            id: request.id,
            status: request.status
          }
        }
    
        io.in(recipientId).emit('deny_friend_request', recipientObj);
        socket.emit('deny_friend_request', senderObj);
      }
    
      return request;
    });


    socket.on('remove_friend', async (friendObj) => {
      // console.log('-----remove_friend------');
      // console.log('----------------------');
      // console.log(friendObj);
 

      let friendshipId = friendObj.id
      let friendId = friendObj.friendId
      let conversationId = friendObj.conversationId

      // console.log('friendshipId | ', friendshipId);
      // console.log('friendId | ', friendId);
 
 

      await friendController.removeFriend(userId, friendObj);
     
      
      socket.emit('friend_removed', friendObj);
      friendObj.friendId = userId
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
          username
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
        let changeChatNameRequest = await chatController.changeChatName(changeObj);
        if(changeChatNameRequest){
          io.in(room).emit('change_chatname', changeObj);
        }
      })
  
      // Edit message in specific room
      socket.on('start_conversation', async (convoObj) => {
        const { friendListIds, friendListNames } = convoObj;
        let newConversation = await chatController.startConversation(convoObj, userId, username);


        if(newConversation){
          friendListIds.map(id=>{
            let recipientConnections = connections[id];

            if(recipientConnections){
              Object.values(recipientConnections).forEach(connection => {
                connection.socket.join(newConversation.id)
                connection.socket.emit('add_conversation', newConversation)
              });
            }
          })
          socket.emit('add_conversation', newConversation)
          socket.emit('go_to_conversation', newConversation)
          socket.join(newConversation.id)



          let content;


          content = `${username} has started a new conversation!`
          emitCustomMessage({conversationId:newConversation.id, content})




          if (friendListNames.length === 1) {
              content = `${friendListNames[0]} has been added to the conversation!`


          } else if(friendListNames.length === 2){
            content = `${friendListNames[0]} and ${friendListNames[1]} have been added to the conversation!`
          }
          
        
          else {
              let lastFriend = friendListNames.pop();
              content = `${friendListNames.join(', ')}, and ${lastFriend} have been added to the conversation!`
          }

          emitCustomMessage({conversationId:newConversation.id, content})

        }
      })


 
      // Edit message in specific room
      socket.on('leave_conversation', async (leaveObj) => {
        const { conversationId } = leaveObj;
        let leaveConversation = await chatController.leaveConversation(conversationId, userId);
        if(leaveConversation){

          let currentConnections = connections[userId];
      
          Object.values(currentConnections).forEach(connection => {
            connection.socket.leave(conversationId);
          });



          socket.emit('remove_conversation', leaveObj)

          content = `${username} has left the conversation!`
          emitCustomMessage({conversationId, content})

          io.in(conversationId).emit('user_left_conversation', {conversationId, userId});






        }
      })

 
      // Edit message in specific room
      socket.on('add_friends_to_conversation', async (convoObj) => {
        const { friendListIds, friendListNames } = convoObj;

        let room = convoObj.conversationId
        let conversation = await chatController.addFriendsToConversation(convoObj);
        
        if(conversation){

        io.in(room).emit('user_joined_conversation', convoObj);


          friendListIds.map(id=>{
            let recipientConnections = connections[id];

            if(recipientConnections){
              Object.values(recipientConnections).forEach(connection => {
                connection.socket.join(conversation.id)
                connection.socket.emit('add_conversation', conversation)
              });
            }
          })

          let content;
          if (friendListNames.length === 1) {
              content = `${username} has added ${friendListNames[0]} to the conversation!`


          } else if(friendListNames.length === 2){
            content = `${username} has added ${friendListNames[0]} and ${friendListNames[1]} to the conversation!`
          }
          
        
          else {
              let lastFriend = friendListNames.pop(); 
              content = `${username} has added ${friendListNames.join(', ')}, and ${lastFriend} to the conversation!`
          }

          emitCustomMessage({conversationId:conversation.id, content})
        }
      }) 


     async function emitCustomMessage(messageObj){
        // Broadcast message to specific room

        let roomUserId = 'e10d8de4-f4c7-0000-0000-000000000000'

        const { conversationId, content, tableId } = messageObj;
        let room = conversationId;
  
        const newMessage = await chatController.createMessage(messageObj, roomUserId);

        // if (!newMessage) console.log('no message');;

        if (!newMessage) return false;
  
  
        newMessageObj = {
          createdAt: Date.now(),
          conversationId,
          content,
          id: newMessage.id,
          userId: roomUserId,
          username: 'Room'
        }; 

        if(tableId){
          newMessageObj.tableId = tableId
          newMessageObj.chatName = rooms?.[tableId]?.chatName
        }
        
        io.in(room).emit('new_message', newMessageObj);

      }




  });
};
