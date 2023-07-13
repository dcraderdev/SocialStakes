const { gameController } = require('./controllers/gameController');
const { drawCards, handSummary, bestValue } = require('./controllers/cardController');
const { cardConverter } = require('./controllers/cardConverter');


module.exports = function (io) {
  const rooms = {};
  let turnTimers = {};

  const disconnectTimeouts = {};

  const roomInit = () => {
    return {
      seats: { },
      roundId: null,
      actionSeat: null,
      actionTimer: null,
      countdownTimer: 0,
      countdownRemaining: 0, 
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
      sortedActivePlayers: [],
      sortedFinishedPlayers: [],
      forfeitedPlayers: [],
      insuredPlayers: {},
    }
  } 


      

  io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId;
    const username = socket.handshake.query.username;

    let socketId = socket.id;

    console.log('-=-=-=-=-=-=-=-=-=');
    console.log('--- CONNECTING ---');
    console.log('SOCKET ID', socketId);
    console.log('A user connected', socket.id, 'Username:', username);
    console.log('User Room:', userId);

    console.log('-=-=-=-=-=-=-=-=-=');

 

    socket.join(userId);

    const userTables = await gameController.getUserTables(userId);

    // Reconnection logic
    if (disconnectTimeouts[userId]) {
      clearTimeout(disconnectTimeouts[userId]);
      console.log(`User ${username} reconnected, timeout cleared.`);
      delete disconnectTimeouts[userId];


      if(userTables){
        for(let table of userTables){
          let tableId = table.tableId
          let seat = table.seat
          let timer = 0
          let messageObj = {
            user: { username: 'Room', id: 1, },
            content: `${username} has reconnected.`,
            room: tableId,
          };
  
          io.in(tableId).emit('new_message', messageObj);
          io.in(tableId).emit('player_reconnected', {seat, tableId, timer});
        }
      }
    }


    socket.on('disconnect', async () => {
      let timer = 5000 // 15 seconds
      console.log(`User ${username} disconnected`);
      const userTables = await gameController.getUserTables(userId);
      if(userTables){
        for(let table of userTables){
          let tableId = table.tableId
          let seat = table.seat


          // If the user has a pending bet and the hand is not in progress, refund the bet
          if (rooms[tableId] && rooms[tableId].seats[seat] && rooms[tableId].seats[seat].pendingBet > 0 && !rooms[tableId].handInProgress) {
            console.log(`Refunding pending bet for user ${username}`);
            rooms[tableId].seats[seat].tableBalance += rooms[tableId].seats[seat].pendingBet;
            rooms[tableId].seats[seat].pendingBet = 0;
          } 

          let messageObj = {
            user: { username: 'Room', id: 1 },
            content: `${username} has disconnected.`,
            room: tableId,
          }; 

          io.in(tableId).emit('new_message', messageObj);
          io.in(tableId).emit('player_disconnected', {seat, tableId, timer});
        }
      }

 

      // Clear the existing timeout for this user (if any)
      if (disconnectTimeouts[userId]) {
        clearTimeout(disconnectTimeouts[userId]);
      }


      // Start a new timeout for this user
      disconnectTimeouts[userId] = setTimeout(async () => {
        console.log('REMOVING PLAYER');
        if(userTables){

          for(let table of userTables){
            let tableId = table.tableId
            let seat = table.seat
          // If the user disconnects during a hand, add them to the forfeited players
            if (rooms[tableId] && rooms[tableId].seats[seat] && rooms[tableId].handInProgress) {
              rooms[tableId].forfeitedPlayers.push({userId, seat});
            }
            let messageObj = {
              user: { username: 'Room', id: 1 },
              content: `${username} did not reconnect in time.`,
              room: tableId,
            }; 

            if(rooms[tableId] && rooms[tableId].seats[seat]){
              delete rooms[tableId].seats[seat];
            }  
            emitUpdatedTable(tableId, io)
  
            io.in(tableId).emit('new_message', messageObj);
            // io.in(tableId).emit('remove_player', {seat, tableId});
          }
        }
        await gameController.removeUserFromTables(userId);

      }, timer); 
    });

      socket.on('join_room', async (room) => {
      console.log('--- join_room ---');
      console.log(`${username} is joining room ${room}.`);
      let tableId = room

      let messageObj = {
        user: {username: 'Room',id: 1,},
        content: `${username} has joined the room.`,
        room,
      };

      let updatedTable = await gameController.getTableById(tableId)



      console.log('-=-=-=-=-=-=-=');
      console.log('-=-=-=-=-=-=-=');
      console.log('-=-=-=-=-=-=-=');
      console.log(updatedTable);
      console.log('-=-=-=-=-=-=-=');
      console.log('-=-=-=-=-=-=-=');
      console.log('-=-=-=-=-=-=-=');



      if (!updatedTable) {
        // TODO: Create logic for creating a new game
      }
        
      // If the room doesnt exist create a new room
      if (!rooms[tableId]) {
        rooms[tableId] = roomInit()
        rooms[tableId].gameSessionId = updatedTable.gameSessions[0].id
        rooms[tableId].blockHash = updatedTable.gameSessions[0].blockHash
        rooms[tableId].decksUsed = updatedTable.Game.decksUsed
        rooms[tableId].shufflePoint = updatedTable.shufflePoint

      }


      let updateObj = {
        tableId,
        table: {
          actionSeat: rooms[tableId].actionSeat,
          actionTimer: rooms[tableId].actionTimer,
          handInProgress: rooms[tableId].handInProgress,
          seats: rooms[tableId].seats,
          countdownRemaining: rooms[tableId].countdownRemaining,
          gameSessionId: rooms[tableId].gameSessionId,
          dealerCards:{
            visibleCards: rooms[tableId].dealerCards.visibleCards,
          } 
        } 
      };

      console.log(updateObj);

      socket.join(room);
      socket.emit('join_table', updatedTable);
      socket.emit('get_updated_table', updateObj);
      io.in(room).emit('new_message', messageObj);
      

      console.log('-=-=-=-=-=-=-=-=-=');
    });

    socket.on('update_table_name', async (updateObj) => {
      console.log('--- update_room ---');
      const {tableId, tableName} = updateObj
      let room = tableId

      let messageObj = {
        user: {username: 'Room',id: 1,},
        content: `${username} has updated the table name to ${tableName}.`,
        room,
      };

    
      console.log(updateObj);


      io.in(room).emit('update_table_name', updateObj);
      io.in(room).emit('new_message', messageObj);
    
      console.log('-=-=-=-=-=-=-=-=-=');
    });

    socket.on('view_room', async (tableId) => {
      console.log('--- view_room ---');
      let room = tableId
      let table = {id: tableId}

      socket.emit('view_table', table);
    });



    socket.on('leave_room', (room) => {
      console.log('--- leave_room ---');
      console.log(`${username} is leaving room ${room}.`);
      console.log('-=-=-=-=-=-=-=-=-=');
      socket.leave(room);
    });

    // Broadcast message to specific room
    socket.on('message', async (messageObj) => {
      const { room, message } = messageObj;
      io.in(room).emit('new_message', messageObj);
      console.log('room',room);

      // io.in(userId).emit('message', messageObj);
      if(rooms[room]){
        rooms[room].messages.push(message)
      }

      console.log('--------------');
      console.log(`Message received from ${room}`);
      console.log('--------------');
    });

    socket.on('take_seat', async (seatObj) => {
      const { room, seat, user, amount } = seatObj;
      let tableId = room

      let messageObj = {
        user: {username: 'Room', id: 1,},
        content: `${username} has taken seat ${seat}.`,
        room,
      };

      const takeSeat = await gameController.takeSeat(tableId, seat, user, amount)

      if(!takeSeat){
        return
      }

      takeSeat['username'] = user.username

      const takeSeatObj = {
        id: takeSeat.id,
        seat: takeSeat.seat,
        tableBalance: takeSeat.tableBalance,
        tableId:  takeSeat.tableId,
        userId:  takeSeat.userId,
        disconnectTimer:  takeSeat.disconnectTimer,
        pendingBet:  takeSeat.pendingBet,
        currentBet:  takeSeat.currentBet,
        username: user.username,
        forfeit: false,
        hands:{},
        cards: []
      }

      
      // If the room doesnt exist create a new room
      if (!rooms[tableId]) {
        let updatedTable = await gameController.getTableById(tableId)
        rooms[tableId] = roomInit()
        rooms[tableId].gameSessionId = updatedTable.gameSessions[0].id
        rooms[tableId].decksUsed = updatedTable.Game.decksUsed
      }


      // Add the player to the room
      rooms[tableId].seats[seat] = takeSeatObj;

      io.in(room).emit('new_message', messageObj);
      io.in(room).emit('new_player', takeSeatObj);

      console.log('--------------');
      console.log(`${username} taking seat${seat} in ${room}`);
      console.log('--------------');
    });


 
    
    socket.on('leave_seat', async (seatObj) => {     
      console.log('--------------');
      console.log(`leave_seat`);
      console.log('--------------');

      const { tableId, seat } = seatObj;
      let room = tableId

      if (rooms[tableId] && rooms[tableId].seats[seat]){
        let player = rooms[tableId].seats[seat]
        let userTableId = rooms[tableId].seats[seat].id
        let userId = rooms[tableId].seats[seat].userId
        let anyPlayersLeft = rooms[tableId].sortedActivePlayers.some(player => player.seat < seat);
        let handInProgress = rooms[tableId].handInProgress
        let leaveSeatObj = {
          tableId,
          seat,
          userTableId,
          userId,
          tableBalance: player.tableBalance,
        }

        // If the user disconnects during a hand, add them to the forfeited players
        if (handInProgress) {
          rooms[tableId].forfeitedPlayers.push({userId, seat});
          io.in(room).emit('player_forfeit', leaveSeatObj);

          if(!anyPlayersLeft){
            await endRound(tableId,io)
          }else {
            let playerHands = Object.entries(player.hands)
            for(let [key, handData] of playerHands){
              handData.turnEnded = true
            }
            await gameLoop(tableId, io)
          }
        } else {

        // Refund pending bet(if exists) for user 
        player.tableBalance += rooms[tableId].seats[seat].pendingBet;
        rooms[tableId].seats[seat].pendingBet = 0;
        leaveSeatObj.tableBalance = player.tableBalance

        // Remove the player from the room state
        if(rooms[tableId] && rooms[tableId].seats[seat]){
          delete rooms[tableId].seats[seat];
        }  

        const leaveSeat = await gameController.leaveSeat(leaveSeatObj)
        if(!leaveSeat) return
        io.in(room).emit('player_leave', leaveSeatObj);
        emitUpdatedTable(tableId, io)
        }
      }
      // if theres other bets continue timer, otherwise cancel
      if (isNoBetsLeft(tableId)) {
        console.log('NO BETS!');
        stopTimer(tableId);
      }
    });

      
      
  
    socket.on('place_bet', async (betObj) => {

      const {bet, tableId, seat } = betObj
      let room = tableId

      // If the room doesnt exist create a new room
      if (!rooms[tableId]) {
        let updatedTable = await gameController.getTableById(tableId)
        rooms[tableId] = roomInit()
        rooms[tableId].gameSessionId = updatedTable.gameSessions[0].id
        rooms[tableId].decksUsed = updatedTable.Game.decksUsed
      }

      // Update pendingBet in the rooms object

      if (rooms[tableId] && rooms[tableId].seats[seat]) {
        rooms[tableId].seats[seat].pendingBet += bet;
        rooms[tableId].seats[seat].tableBalance -= bet;
      }


      console.log(rooms);
      console.log(rooms[tableId]);

      // Countdown duration
      const countdownDuration = 5000; // 5 seconds

      // Start a new countdown
      let countdownRemaining = countdownDuration;



      if (rooms[tableId].countdownTimer) {
        console.log(`Timer already running for table ${tableId}`);

      }

      // Start a new countdown if one isn't already running
      if (!rooms[tableId].countdownTimer) {
        
        
        rooms[tableId].countdownTimer = setInterval(() => {
          countdownRemaining -= 1000;
          rooms[tableId].countdownRemaining = countdownRemaining;
          if (countdownRemaining <= 0) {

            // if theres bets, start hand otherwise cancel
            if (isNoBetsLeft(tableId)) {
              console.log('NO BETS!');
              stopTimer(tableId);
              return
            }


            clearInterval(rooms[tableId].countdownTimer);
            rooms[tableId].countdownTimer = null;
            rooms[tableId].countdownRemaining = 0;
            rooms[tableId].handInProgress = true;

            // Transfer pendingBet to currentBet for each seat
            for (let seatKey in rooms[tableId].seats) {
              const seat = rooms[tableId].seats[seatKey];
              seat.currentBet += seat.pendingBet;
              seat.pendingBet = 0;
            }
            let updateObj = {
              tableId,
              table: {
                handInProgress: true,
                seats: rooms[tableId].seats,
                countdownRemaining
              } 
            }; 
       
            socket.join(room);
            io.in(room).emit('get_updated_table', updateObj);

            // Countdown finished, emit event to collect all bets
            let countdownObj = {
              countdownRemaining,
              tableId
            }
            io.in(room).emit('collect_bets', countdownObj);
            dealCards(tableId, io);
          } 
        }, 1000); 
      } 
       
      let countdownObj = {
        countdownRemaining,
        tableId
      }
      
      io.in(room).emit('new_bet', betObj);
      io.in(room).emit('countdown_update', countdownObj);

      console.log('--------------');
      console.log(`Bet(${bet}) received from ${username} @room ${room}`);
      console.log('--------------');
    });

    socket.on('remove_last_bet', async (betObj) => {
      const { tableId, seat, lastBet } = betObj
      let room = tableId

      // Update pendingBet in the rooms object
      if (rooms[tableId] && rooms[tableId].seats[seat]) {
        rooms[tableId].seats[seat].pendingBet -= lastBet;
        rooms[tableId].seats[seat].tableBalance += lastBet;

      }

      io.in(room).emit('remove_last_bet', betObj);

      if (isNoBetsLeft(tableId)) {
        stopTimer(tableId);
      }

      console.log('--------------');
      console.log(`Removing last bet(${lastBet}) received from ${username} @room ${room}`);
      console.log('--------------');
    });

 
    socket.on('remove_all_bet', async (betObj) => {
      const { tableId, seat, lastBet } = betObj
      let room = tableId

      // Update pendingBet in the rooms object
      if (rooms[tableId] && rooms[tableId].seats[seat]) {
        let pendingBet = rooms[tableId].seats[seat].pendingBet
        rooms[tableId].seats[seat].tableBalance += pendingBet;
        rooms[tableId].seats[seat].pendingBet = 0;  
      }

      io.in(room).emit('remove_all_bet', betObj);

      if (isNoBetsLeft(tableId)) {
        stopTimer(tableId);
      }

      console.log('--------------');
      console.log(`Removing all bets received from ${username} @room ${room}`);
      console.log('--------------');
    });

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
      let room = tableId
      // Check if the countdownTimer exists before trying to clear it
      if (rooms[tableId] && rooms[tableId].countdownTimer) {
        clearInterval(rooms[tableId].countdownTimer);
        delete rooms[tableId].countdownTimer

        let countdownObj = {
          countdownRemaining:0,
          tableId
        }
        
        io.in(room).emit('countdown_update', countdownObj);
        console.log(`Timer stopped for tableId: ${tableId}`);
      }
    } 




    socket.on('add_funds', async (seatObj) => {
      const {tableId, seat, userId, amount } = seatObj
      let room = tableId
      let userTableId

      //Server resets and throws error while working
      // This prevents the error from being thrown until we can reset seat
      if(rooms[tableId].seats[seat].id){
        userTableId = rooms[tableId].seats[seat].id
      }
      //attach userTableId to seat Obj
      seatObj.userTableId= userTableId


      const addFunds = await gameController.addFunds(seatObj)

      if(!addFunds){
        return
      } 
  
       
      if(addFunds){
        if (rooms[tableId] && rooms[tableId].seats[seat]) {
          rooms[tableId].seats[seat].tableBalance += amount;
        }
        io.in(room).emit('player_add_table_funds', seatObj);
      }



      console.log('--------------');
      console.log(`Adding funds(${amount}) for ${username} @room ${room}`);
      console.log('--------------');
    });




    socket.on('accept_insurance', async (betObj) => {
      const { bet, insuranceCost, tableId, seat } = betObj

      let room = tableId
      let currentHandId = Object.keys(rooms[tableId].seats[seat].hands)[0]


      // remove insurance cost form players tableBalance
      rooms[tableId].seats[seat].tableBalance -= insuranceCost 
      //update hand to show insurance was accepted

       
      console.log('------- INSURANCE CHECK -------');
      console.log('currentHandId', currentHandId);
      console.log('rooms[tableId].seats[seat]',rooms[tableId].seats[seat]);
      console.log('rooms[tableId].seats[seat]',rooms[tableId].seats[seat].hands);
      // console.log('rooms[tableId].seats[seat].hands',rooms[tableId].seats[seat].hands); 
      console.log('------------------------');

      rooms[tableId].seats[seat].hands[currentHandId]['insurance'] = {accepted: true, bet:bet}

      // Add player to insured players array
      rooms[tableId].insuredPlayers[seat] = insuranceCost

      
 
      emitUpdatedTable(tableId, io)


      console.log('--------------');
      console.log(`Insurance accepted(${insuranceCost}) for ${username} @room ${room}`);
      console.log('--------------');
    });
 
 
 

      // starts game of blackjack for multiple players
      async function dealCards(tableId, io) {
      console.log('------- DEALING CARDS -------');
        let room = tableId
  
        let dealObj = {
          tableId,
          gameSessionId: rooms[tableId].gameSessionId,
          blockHash: rooms[tableId].blockHash,
          nonce: rooms[tableId].nonce,
          decksUsed: rooms[tableId].decksUsed
        }

        let roundId, deck

        console.log('------- dealObj -------');
        console.log(dealObj);
        console.log('------------------------');

        // if no deck or deck cursor is past shuffle point
        // increment nonce and create new deck
        if(rooms[tableId].cursor >= rooms[tableId].shufflePoint || !rooms[tableId].deck){

          // generate cards and create Round entry in db
          dealObj.nonce++
          rooms[tableId].nonce++

          const deckandRoundId = await gameController.dealCards(dealObj)
          if(!deckandRoundId){
            return
          }
          deck = deckandRoundId.deck
          roundId = deckandRoundId.roundId
          // Assign deck and roundId to room
          rooms[tableId].deck = deck
          rooms[tableId].roundId = roundId
          rooms[tableId].cursor = 0
        } else {
          deck = rooms[tableId].deck
          roundId = await gameController.newRound(dealObj)
          rooms[tableId].roundId = roundId
        }
 
        // Calculate number of cards to draw
        // numSeats with currentBets + cards for dealer
        // Sort the seats by seat number and only include those with a current bet
        let sortedSeats = Object.entries(rooms[tableId].seats)
          .filter(([i, seat]) => seat.currentBet > 0)
          .sort(([seatNumberA], [seatNumberB]) => seatNumberA - seatNumberB)
          .map(([i, seat]) => seat);


        // Set sorted seats for gameLoop  
        rooms[tableId].sortedActivePlayers = sortedSeats

        console.log('------- sortedSeats -------');
        console.log(sortedSeats);
        console.log('------------------------');

        let userTableIds = sortedSeats.map(seat=>seat.id)  
 
        console.log('------- ROUND ID -------');
        console.log(userTableIds);
        console.log(roundId);
        console.log('------------------------');
  
        // Create hand for each active player
        const handIds = await gameController.createHands(userTableIds, roundId)
        let numSeatsWithBets = sortedSeats.length + 1;
        let cardsToDraw = numSeatsWithBets * 2
        let cursor = rooms[tableId].cursor
  
        let drawObj = {
          deck,
          cardsToDraw,
          cursor
        } 
        const drawnCardsAndDeck = drawCards(drawObj)
        const {drawnCards, newDeck} = drawnCardsAndDeck

        console.log('------- newDeck -------');
        console.log(newDeck);
        console.log('------------------------');

        console.log('------- drawnCards -------');
        console.log(drawnCards);
        console.log('------------------------');

        rooms[tableId].deck = newDeck

        if(handIds && drawnCards){  
                // Distribute the cards 
                for(let j = 0; j < 2; j++){
                  for (let i = 0; i < sortedSeats.length; i++) {
                    let seat = sortedSeats[i];
                    // Get the next card and remove it from the drawnCards array
                    let nextCard = drawnCards.shift()
                    let modCard = nextCard % 51
                    seat.cards.push(modCard);
                      // Create a newHand inside the handsObj in case we need to split during the hand
                      // Use the map we created to get the handIds
                      if(!seat.hands[`${handIds[i]}`]){
                        seat.hands[`${handIds[i]}`] = {
                          cards: [],
                          bet: null,
                          turnEnded: false,
                          summary: null
                        }   
                      }
                      seat.hands[`${handIds[i]}`].cards.push(modCard);
                      seat.hands[`${handIds[i]}`].bet = seat.currentBet;
                  }
                  // Distribute the cards to the dealer
                  let nextCard = drawnCards.shift()
                  let modCard = nextCard % 51
                  console.log('------- modCard -------');
                  console.log(modCard);
                  console.log('------------------------');
                  if(j===1){
                    rooms[tableId].dealerCards.hiddenCards.push(modCard)
                  }else {
                    rooms[tableId].dealerCards.visibleCards.push(modCard)
                  } 
                }   
        } 
 
   
   

        // Set new cursor point, setDealers cards
        rooms[tableId].cursor += cardsToDraw 

        console.log('_*_*_*_*_*_*_*_*_*_*_*_**_');
        console.log('_*_*_*_*_*_*_*_*_*_*_*_**_');
        console.log('cardsToDraw:', cardsToDraw);
        console.log('NEW CURSOR:', rooms[tableId].cursor);
        console.log('_*_*_*_*_*_*_*_*_*_*_*_**_');
        console.log('_*_*_*_*_*_*_*_*_*_*_*_**_');
  
        let updateObj = {
          tableId,
          table: {
            seats: rooms[tableId].seats,
            dealerCards:{
              visibleCards: rooms[tableId].dealerCards.visibleCards,
            }
          },
        };
        console.log(updateObj);
        io.in(room).emit('get_updated_table', updateObj);


        console.log('------- dealer cards -------');
        console.log(rooms[tableId].dealerCards.visibleCards[0]);
        console.log(rooms[tableId].dealerCards.hiddenCards[0]);
        console.log('------- ------------ -------');

        let dealerVisibleCard = rooms[tableId].dealerCards.visibleCards[0]
        let dealerHiddenCard = rooms[tableId].dealerCards.hiddenCards[0]




 
        let isAce = cardConverter[dealerVisibleCard].value === 11
        let isMonkey = cardConverter[dealerHiddenCard].value === 10

        if(isAce){
          socket.emit('offer_insurance', tableId)
          await new Promise(resolve => setTimeout(resolve, 5000));  // Wait for 10 seconds
          socket.emit('remove_insurance_offer', tableId)
        }
        
        // if dealer has blackjack, skip to end of round
        if(isAce && isMonkey){
          await handleDealerBlackjack(tableId)
          await endRound(tableId, io)
        } else {
          await gameLoop(tableId, io)
        }

      }

 

      async function handleDealerBlackjack(tableId){
        let room = tableId
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
        rooms[tableId].dealerCards.naturalBlackjack = true


        // Move players to finsihed Array for endGame processing
        rooms[tableId].sortedFinishedPlayers = [...rooms[tableId].sortedActivePlayers]
        rooms[tableId].sortedActivePlayers = []
        rooms[tableId].dealerCards.visibleCards = newCards

        // show the blackjack
        let updateObj = {
          tableId,
          table: {
              actionSeat: null,
              seats: rooms[tableId].seats,
              dealerCards: {
                  visibleCards: dealerCards.visibleCards,
              }
          },
      }; 
  
      io.in(room).emit('get_updated_table', updateObj);

      }


      async function gameLoop(tableId, io) {
        console.log('------- GAME LOOP -------');
        console.log('------- CURSOR -------');
        console.log('');
        console.log(rooms[tableId].cursor);
        console.log('');
        console.log('----------------------');
        let room = tableId

        
        // // Emit latest decision to clients
        emitUpdatedTable(tableId, io)



        // Get next player
        let nextPlayer = getNextPlayer(tableId)

        // If none, handle dealer turn
        if(!nextPlayer){
          console.log('DEALERS TURN');
          await handleDealerTurn(tableId, io)
          return
        } 
 
        // If some, handle player turn
        await handlePlayerTurn(tableId, nextPlayer, io)

        // cirlce back into gameLoop
        await gameLoop(tableId, io)
 
      }
 
      //returns next player or false if all players have acted
      function getNextPlayer(tableId){
        console.log('------- GETTING NEXT PLAYER -------');

        let sortedActivePlayers = rooms[tableId].sortedActivePlayers
        let nextPlayer
        if(rooms[tableId] && sortedActivePlayers.length){
          nextPlayer = sortedActivePlayers[sortedActivePlayers.length-1]
        } 
        if(nextPlayer){
          return nextPlayer
        } else {
          return false
        } 
      }

      async function handlePlayerTurn(tableId, player, io){
        console.log('HANDLING PLAYER TURN');
        let room = tableId


        //Iterate over each player's hand 
        let playerHands = Object.entries(player.hands)
        // If all hands are done, move the player to sortedFinishedPlayers
        let allHandsEnded = true;
        for(let [key, handData] of playerHands){
          if (!handData.turnEnded){
            allHandsEnded = false;
            break;
          }
        }
        if(allHandsEnded){
          let nextPlayer = rooms[tableId].sortedActivePlayers.pop()
          rooms[tableId].sortedFinishedPlayers.push(nextPlayer)
          // await gameLoop(tableId, io) 
          return
        } 

        for(let [key, handData] of playerHands){
 
                console.log('-=-=-=-=-=-');
                console.log(player);
                console.log(handData);
                console.log('-=-=-=-=-=-'); 
       
                if (handData.turnEnded) continue;

                let cards = handData.cards
                let playerHand = await handSummary(cards) 
                let playerBestValue = await bestValue(playerHand.values) 
                // Assign handSummary to hand 
                handData.summary = playerHand;

                if(playerHand.blackjack || playerHand.busted || playerBestValue === 21){
                  handData.turnEnded = true;
                  clearInterval(rooms[tableId].timerId);
                  continue
                }

                // Create actionTimer 
                rooms[tableId].actionTimer = 500000;
        
                // Set action seat
                rooms[tableId].actionSeat = player.seat
         
                // Emit update to clients
                let updateObj = {
                  tableId,
                  table: {
                    actionSeat: player.seat,
                    actionHand: key,
                    actionTimer: rooms[tableId].actionTimer,
                    seats: rooms[tableId].seats,
                    dealerCards:{
                      visibleCards: rooms[tableId].dealerCards.visibleCards,
                    }
                  },
                };  
        
              io.in(room).emit('get_updated_table', updateObj);
              // // If timer already exists, return without creating another one
              // if (rooms[tableId].timerId) {
              //   clearInterval(rooms[tableId].timerId)
              // }


                // Create timer and store its id in the room object
                return new Promise((resolve, reject) => {
                  rooms[tableId].timerId = setInterval(async() => {
                    rooms[tableId].actionTimer -= 1000; // Decrement by 1 second
                    console.log('COUNTDOWN: ',rooms[tableId].actionTimer);
                    // If timer reaches 0, clear interval and emit a timeout event
                    if (rooms[tableId].actionTimer <= 0) {
                      clearInterval(rooms[tableId].timerId);
                      
                      console.log('TURN OVER');
                      // Set turnEnded to true for this hand
                      handData.turnEnded = true;
                      resolve(); // Resolve the promise to let the game loop continue
                    } 
                  }, 1000)
                });
              
        }
          return
      }            
      


      socket.on('player_action', async (actionObj) => {
        const {tableId, action, seat, handId } = actionObj
        let room = tableId
  
        let messageObj = {
          user: { username: 'Room', id: 1, },
          content: `${username} has ${action}.`,
          room: tableId,
        }  
  
  
        // Reset the timer whenever a player takes an action
        if(rooms[tableId] && rooms[tableId].timerId){
          clearInterval(rooms[tableId].timerId);
          rooms[tableId].actionTimer = 0;  
        } 
         

        let updateObj = {
          tableId,
          table: {
            actionTimer: rooms[tableId].actionTimer,
            seats: rooms[tableId].seats,
            dealerCards:{
              visibleCards: rooms[tableId].dealerCards.visibleCards,
            }
          }, 
        };

        io.in(room).emit('get_updated_table', updateObj);
        io.in(room).emit('new_message', messageObj);
 
        console.log('--------------');
        console.log(`Handling action(${action}) for ${username} @room ${room}`);
        console.log('--------------');

        
        if(action === 'hit' ){
          await playerHit(actionObj, io)
          
        }
        if(action === 'stay' ){
          await playerStay(actionObj, io)
          
        }
        if(action === 'double' ){
          await playerDouble(actionObj, io)
      
        }
        if(action === 'split' ){
          await playerSplit(actionObj, io)
          
        }
        if(action === 'insurance' ){
          await playerInsurance(actionObj, io)
        }

         
        await gameLoop(tableId, io) 
  
      });

      async function playerHit(actionObj, io){
        const {tableId, action, seat, handId } = actionObj
        let currentHand = rooms[tableId].seats[seat].hands[handId]
        let cardsToDraw = 1

        let drawObj = {
          deck: rooms[tableId].deck,
          cardsToDraw,
          cursor:rooms[tableId].cursor
        } 



        const drawnCardsAndDeck = drawCards(drawObj)
        const {drawnCards, newDeck} = drawnCardsAndDeck

        rooms[tableId].deck = newDeck

        // const newCard = await drawCards(drawObj)
        rooms[tableId].cursor += cardsToDraw
        currentHand.cards.push(...drawnCards);
        return
 
      }

      // Handle player stay action
      async function playerStay(actionObj, io){
        const {tableId, action, seat, handId } = actionObj

      // Update hand to show no more decisions need to be made for the gameLoop
        let playersHand = rooms[tableId].seats[seat].hands[handId]
        playersHand.turnEnded = true
        return

      }

      async function playerSplit(actionObj, io){
        const {tableId, action, seat, handId } = actionObj
        let room = tableId;
        let userTableId = rooms[tableId].seats[seat].id;
        let roundId = rooms[tableId].roundId
        let currentSeat = rooms[tableId].seats[seat]

        // Create new hand for the split
        const newHand = await gameController.createHand(userTableId, roundId);
        let newHandId = newHand.id

        if (!newHand) {
          await gameLoop(tableId, io)
        }


        if (newHand) {
          // Get the existing hand
          let existingHand = rooms[tableId].seats[seat].hands[handId];


          if (existingHand.cards.length < 2) {
            console.error('Not enough cards to split.');
            return;
          }

          // Remove chips from table balance if available
          if(currentSeat.tableBalance < existingHand.bet) return
          currentSeat.tableBalance -= existingHand.bet;


          
          // Split the cards between the two hands
          // Add the current bet to the newHands bet
          let cardToMove = existingHand.cards.pop();
          let newSplitHand = {
            cards: [cardToMove],
            bet: existingHand.bet,
            turnEnded: false
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
        return

      } 

      async function playerDouble(actionObj, io){
        const {tableId, action, seat, handId } = actionObj
        let currentSeat = rooms[tableId].seats[seat]
        let currentHand = rooms[tableId].seats[seat].hands[handId]
        let currentBet = rooms[tableId].seats[seat].hands[handId].bet
        let cardsToDraw = 1
        let drawObj = {
          deck: rooms[tableId].deck,
          cardsToDraw,
          cursor:rooms[tableId].cursor
        }


        // Double the current bet, remove chips from table balance
        // currentBet *= 2;
        currentSeat.tableBalance -= currentBet;

        // Save the updated balance and bet in rooms object
        currentHand.bet += currentBet;
        
        // // Draw one more card and push to currentHand
        // const newCard = await drawCards(drawObj)
        // currentHand.cards.push(newCard);
        // rooms[tableId].cursor += cardsToDraw

        const drawnCardsAndDeck = drawCards(drawObj)
        const {drawnCards, newDeck} = drawnCardsAndDeck


        rooms[tableId].deck = newDeck

        // const newCard = await drawCards(drawObj)
        rooms[tableId].cursor += cardsToDraw
        currentHand.cards.push(...drawnCards);

        // Update hand to show no more decisions need to be made for the gameLoop
        let playersHand = rooms[tableId].seats[seat].hands[handId]
        playersHand.turnEnded = true
        rooms[tableId].seats[seat].hands[handId] = playersHand
        return

        // End players turn
        // rooms[tableId].sortedFinishedPlayers.push(nextPlayer)
      }



 

      async function handleDealerTurn(tableId, io) {
        console.log('HANDLING DEALER TURN');
    
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
                }
            },
        };
    
        io.in(room).emit('get_updated_table', updateObj);


      // Check if there's at least one player who hasn't busted
      let anyPlayersLeft = rooms[tableId].sortedFinishedPlayers.some(player => 
        Object.values(player.hands).some(hand => 
            hand.summary && !hand.summary.busted
        )
      );

      // If all players have busted, end the round without drawing cards
      if (!anyPlayersLeft) {
        console.log('ALL PLAYERS BUSTED');
        await endRound(tableId, io);
        return;
      }
    
        // Execute dealer's strategy
        let stop = false;
        while (!stop) { 
            // Calculate hand summary and best value
            let dealerHand = await handSummary(newCards);
            let bestDealerValue = await bestValue(dealerHand.values);
    
            console.log('--------------');
            console.log(dealerCards.visibleCards);
            console.log(dealerHand);
            console.log(bestDealerValue);
            console.log('dealerHand.softSeventeen', dealerHand.softSeventeen);
            console.log('bestDealerValue', bestDealerValue);
            console.log('--------------');
    
            // Stop if dealer's best value is 17 or more and the hand is not a soft seventeen
            if (bestDealerValue >= 17 && !dealerHand.softSeventeen) {
                console.log('DEALER STAYS');
                dealerCards.handSummary = dealerHand;
                dealerCards.bestValue = bestDealerValue;
                stop = true;
                continue;
            }
    
            // Draw a card if dealer's best value is 16 or less, or the hand is a soft seventeen
            console.log('dealerHand.softSeventeen', dealerHand.softSeventeen);
            console.log('bestDealerValue', bestDealerValue);
    
            let cardsToDraw = 1;
            let drawObj = {
                deck: rooms[tableId].deck,
                cardsToDraw,
                cursor: rooms[tableId].cursor,
            }; 
    
            let { drawnCards, newDeck } = drawCards(drawObj);
    
            console.log('------- newDeck dealer -------');
            console.log(newDeck);
            console.log('------------------------');
    
            rooms[tableId].deck = newDeck;
            newCards.push(...drawnCards);
            dealerCards.visibleCards = newCards;  // Update the visible cards
    
            // Set new cursor point
            rooms[tableId].cursor++;
        }
     
        // Dealer's turn is finished, end the round
        await endRound(tableId, io);
    }
  
    async function determineResult(bestPlayerValue, bestDealerValue, bet, blackjack) {
      let result;
      let profitLoss;
      let winnings = 0;
    
      if (bestPlayerValue > 21){
        result = 'LOSE';
        profitLoss = -bet;
      } else if (bestPlayerValue === bestDealerValue){
        result = 'PUSH';
        profitLoss = 0;
        winnings = bet; 
      } else if (blackjack){
        result = 'BLACKJACK';
        profitLoss = bet * 1.5;
        winnings = bet * 2.5;
      } else if (bestDealerValue > 21 || bestPlayerValue > bestDealerValue){
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
        winnings
      };
    }
    

    async function processForfeitedPlayers(tableId, io) {
      let room = tableId

      
       
      if(rooms[tableId] && rooms[tableId].forfeitedPlayers){

        console.log('-=-=-=-=-=-=-=--');
        console.log('-=-=-=-=-=-=-=--');
        console.log(rooms[tableId].forfeitedPlayers);
        console.log('-=-=-=-=-=-=-=--');
        console.log('-=-=-=-=-=-=-=--');
        console.log('-=-=-=-=-=-=-=--');
        let forfeitedPlayers = rooms[tableId].forfeitedPlayers;
        for(let player of forfeitedPlayers){

          console.log('-=-=-=-=-=-=-=--');
          console.log('-=-=-=-=-=-=-=--');
          console.log(player);
          console.log('-=-=-=-=-=-=-=--');
          console.log('-=-=-=-=-=-=-=--');
          console.log('-=-=-=-=-=-=-=--');


          const {userId, seat } = player;
          let userTableId = rooms[tableId]?.seats?.[seat].id;
          let tableBalance = rooms[tableId]?.seats?.[seat].tableBalance;
    
          // Remove the player from the room state
          if(rooms[tableId] && rooms[tableId]?.seats?.[seat]){
            delete rooms[tableId].seats[seat];
                    // Remove the player from the room state
        if(rooms[tableId] && rooms[tableId].seats[seat]){
          delete rooms[tableId].seats[seat];
        }  
        // const leaveSeat = await gameController.leaveSeat(leaveSeatObj)
        // if(!leaveSeat) return
        // emitUpdatedTable(tableId, io)
      }  
      
      let leaveSeatObj = {
        tableId,
        seat,
        userTableId,
        userId,
        tableBalance,
      }
      emitUpdatedTable(tableId, io)
      
      await gameController.leaveSeat(leaveSeatObj);
      io.in(room).emit('player_leave', leaveSeatObj);
          // io.in(tableId).emit('remove_player', leaveSeatObj);
        }
      }
    }

    function updateAndClearPlayerData(player, totalWinnings, tableId) {
      player.tableBalance += totalWinnings;
      rooms[tableId].seats[player.seat].hands = {};
      rooms[tableId].seats[player.seat].cards = [];
      rooms[tableId].seats[player.seat].pendingBet = 0;
      rooms[tableId].seats[player.seat].currentBet = 0;
    }

    async function calculateAndSavePlayerHand(player, bestDealerValue, tableId, io) {
      
      let room = tableId
      let totalWinnings = 0;
      let totalProfitLoss = 0;
    
      let playerHands = Object.entries(player.hands);
      for(let [key, handData] of playerHands){
        let { cards, bet } = handData;
        let playerHand = await handSummary(cards);
        let bestPlayerValue = await bestValue(playerHand.values);


        // Determine the result of any insurance
        const {insuranceWinnings, insuranceProfitLoss, hasInsuranceBet} = handleInsurancePayout(tableId, player.seat);
    
        // Determine the result of the hand 
        const { result, profitLoss, winnings } = await determineResult(bestPlayerValue, bestDealerValue, bet, playerHand.blackjack);


        totalWinnings += winnings;
        totalWinnings += insuranceWinnings;

        totalProfitLoss += profitLoss
        totalProfitLoss += insuranceProfitLoss;

    
        let handObj = {
          handId: key,
          userTableId: player.id,
          cards: JSON.stringify(cards),
          result,
          totalProfitLoss,
          hasInsuranceBet
        }
        
        // Save the results
        await gameController.savePlayerHand(handObj)
    
        //Update the hands bet to show profit/loss
        rooms[tableId].seats[player.seat].hands[key].bet += profitLoss;

        // Display winnings or losses of each bet
        let updateObj = {
           tableId,
           table: {
             seats: rooms[tableId].seats,
             dealerCards:{
               visibleCards: rooms[tableId].dealerCards.visibleCards,
             } 
           },
        };
        io.in(room).emit('get_updated_table', updateObj);
                 
      }
    
      return {
        totalWinnings
      };
    }

    function resetRoomForNextHand(tableId) {
      rooms[tableId].dealerCards = {
        naturalBlackjack: false,
        hiddenCards: [],
        visibleCards: [],
        otherCards: [],
        handSummary: null,
        bestValue: null
      }
    
      rooms[tableId].forfeitedPlayers = [];
      rooms[tableId].sortedFinishedPlayers = [];
      rooms[tableId].insuredPlayers = {};
      rooms[tableId].handInProgress = false;
      rooms[tableId].actionSeat = null;
      clearInterval(rooms[tableId].timerId);
      rooms[tableId].actionTimer = null;

    }


    function emitUpdatedTable(tableId, io) {
      if(!rooms[tableId])return
      let room = tableId
      let updateObj = {
        tableId,
        table: {
          seats: rooms[tableId].seats,
          dealerCards:{
            visibleCards: rooms[tableId].dealerCards.visibleCards,
          }
        },
      };
    
      io.in(room).emit('get_updated_table', updateObj);
    }
    


    function handleInsurancePayout(tableId, seat) {
      let naturalBlackjack = rooms[tableId].dealerCards.naturalBlackjack;
      let bet = rooms[tableId].insuredPlayers[seat]
      let hasInsuranceBet = false
      let insuranceWinnings = 0
      let insuranceProfitLoss = 0


      if(rooms[tableId].insuredPlayers[seat]){
        hasInsuranceBet = true
        if(naturalBlackjack){
          insuranceWinnings = bet * 2
          insuranceProfitLoss = bet
        } else {
          insuranceWinnings = 0
          insuranceProfitLoss = -bet
        }
        
    }
      return {insuranceWinnings, insuranceProfitLoss, hasInsuranceBet}
    }

    
    async function endRound(tableId, io) {
      console.log('------- END ROUND -------');
      let room = tableId;
      let bestDealerValue = rooms[tableId].dealerCards.bestValue;
      let finishedPlayers = rooms[tableId].sortedFinishedPlayers;

      stopTimer(tableId)
      // Update table with latest info before ending the round
      emitUpdatedTable(tableId, io);
      
      if(!finishedPlayers.length){
        // Do something
      }
    
      // Iterate over each player and keep track of any winnings
      for(let player of finishedPlayers){

        // Calculate and save player hand results

        console.log('------- player -------');
        console.log(player);
        console.log('----------------------');



        let { totalWinnings } = await calculateAndSavePlayerHand(player, bestDealerValue, tableId, io);


        console.log('------- totalWinnings -------');
        console.log(totalWinnings);
        console.log('----------------------');
       
    
        // Update and clear player data
        updateAndClearPlayerData(player, totalWinnings, tableId);
    
 
        await new Promise(resolve => setTimeout(resolve, 3000));
    
        // Display any winnings going to tableBalance
        emitUpdatedTable(tableId, io);
        
      }
    
      // Save dealer's cards to db and reset the room for the next hand
      let dealersCards = rooms[tableId].dealerCards.visibleCards.flat(5);
      let handObj = {
        id:rooms[tableId]?.roundId,
        cards: JSON.stringify(dealersCards),
        active: false,
        nonce: rooms[tableId].nonce
      }
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
          dealerCards:{
            visibleCards: rooms[tableId].dealerCards.visibleCards,
          }
        },
      };
    
      io.in(room).emit('get_updated_table', updateObj);
    
      console.log('HAND OVER');
    }


  });
};
