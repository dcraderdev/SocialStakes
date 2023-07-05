const { gameController } = require('./controllers/gameController');
const { drawCards, handSummary, bestValue } = require('./controllers/cardController');


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
  
            io.in(tableId).emit('new_message', messageObj);
            io.in(tableId).emit('remove_player', {seat, tableId});
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
      socket.emit('view_table', updatedTable);
      socket.emit('get_updated_table', updateObj);
      io.in(room).emit('new_message', messageObj);
      

      console.log('-=-=-=-=-=-=-=-=-=');
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
      // io.in(userId).emit('message', messageObj);

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

      const { room, seat, user, tableBalance } = seatObj;
      let tableId = room
      
      
      
      // If server resets seats, we can reset all user's seats without resetting db
      if(rooms[tableId]?.seats[seat] === undefined){
        await gameController.removeUserFromTables(user.id);
        // Remove the player from the room state
        if(rooms[tableId] && rooms[tableId].seats[seat]){
          delete rooms[tableId].seats[seat];
        }  
        return
      }
      
      
      
      // If the user disconnects during a hand, add them to the forfeited players
      if (rooms[tableId] && rooms[tableId].seats[seat] && rooms[tableId].handInProgress) {
        console.log('hand in progress while leaving');
        
        let userTableId = rooms[tableId].seats[seat].id
        let leaveSeatObj = {
          tableId,
          seat,
          userTableId,
          userId:user.id,
          tableBalance,
        }

        
        
        rooms[tableId].forfeitedPlayers.push({userId, seat});
        io.in(room).emit('player_forfeit', leaveSeatObj);

      }


      // If the user has a pending bet and the hand is not in progress, refund the bet and remove them from table
      else if (rooms[tableId] && rooms[tableId].seats[seat] && rooms[tableId].seats[seat].pendingBet > 0 && !rooms[tableId].handInProgress) {
        console.log('pending bet NO hand in progress while leaving');

        let userTableId = rooms[tableId].seats[seat].id
        let leaveSeatObj = {
          tableId,
          seat,
          userTableId,
          userId:user.id,
          tableBalance,
        }
        // Refund pending bet for user 
        rooms[tableId].seats[seat].tableBalance += rooms[tableId].seats[seat].pendingBet;
        rooms[tableId].seats[seat].pendingBet = 0;
        
        // Remove the player from the room state
        if(rooms[tableId] && rooms[tableId].seats[seat]){
          delete rooms[tableId].seats[seat];
        }  
        
        const leaveSeat = await gameController.leaveSeat(leaveSeatObj)
        if(!leaveSeat) return
        io.in(room).emit('player_leave', leaveSeatObj);

      } else {

        let userTableId = rooms[tableId].seats[seat].id
        let leaveSeatObj = {
          tableId,
          seat,
          userTableId,
          userId:user.id,
          tableBalance,
        }
        const leaveSeat = await gameController.leaveSeat(leaveSeatObj)
        if(!leaveSeat) return
        io.in(room).emit('player_leave', leaveSeatObj);
        
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
      const countdownDuration = 2000; // 5 seconds

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



      
        console.log('-=-=-=-=--=-=-=--=-');
        console.log('-=-=-=-=--=-=-=--=-');
        console.log(dealObj);
        console.log(rooms[tableId].cursor);
        console.log(rooms[tableId].shufflePoint);
        console.log('-=-=-=-=--=-=-=--=-');
        console.log('-=-=-=-=--=-=-=--=-');

        
        
        
        // if no deck or deck cursor is past shuffle point
        // increment nonce and create new deck
        if(rooms[tableId].cursor >= rooms[tableId].shufflePoint || !rooms[tableId].deck){

          console.log('-=-=-=-=--=-=-=--=-');
          console.log('-=-=-=-=--=-=-=--=-');
          console.log('-=-=-=-=--=-=-=--=-');
          console.log('-=-=-=-=--=-=-=--=-');
          console.log('NEED NEW DECK');
          console.log(rooms[tableId].cursor);
          console.log(rooms[tableId].shufflePoint);
          console.log(rooms[tableId].cursor >= rooms[tableId].shufflePoint); 
          console.log(rooms[tableId].deck);
          console.log('-=-=-=-=--=-=-=--=-');
          console.log('-=-=-=-=--=-=-=--=-');
          console.log('-=-=-=-=--=-=-=--=-');
          console.log('-=-=-=-=--=-=-=--=-');
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



        console.log(rooms[tableId].deck);

 
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
        const drawnCardsAndDeck = await drawCards(drawObj)
        const {drawnCards, newDeck} = drawnCardsAndDeck

        console.log('------- newDeck -------');
        console.log(newDeck);
        console.log('------------------------');

        rooms[tableId].deck = newDeck

        if(handIds && drawnCards){  
                // Distribute the cards 
                for(let j = 0; j < 2; j++){
                  for (let i = 0; i < sortedSeats.length; i++) {
                    let seat = sortedSeats[i];
                    // Get the next card and remove it from the drawnCards array
                    let nextCard = drawnCards.shift()
                    seat.cards.push(nextCard);
                      // Create a newHand inside the handsObj in case we need to split during the hand
                      // Use the map we created to get the handIds
                      if(!seat.hands[`${handIds[i]}`]){
                        seat.hands[`${handIds[i]}`] = {
                          cards: [],
                          bet: null,
                          turnEnded: false
                        }  
                      }
                      seat.hands[`${handIds[i]}`].cards.push(nextCard);
                      seat.hands[`${handIds[i]}`].bet = seat.currentBet;
                  }
                  // Distribute the cards to the dealer
                  let nextCard = drawnCards.shift()
                  if(j===1){
                    rooms[tableId].dealerCards.hiddenCards.push(nextCard)
                  }else {
                    rooms[tableId].dealerCards.visibleCards.push(nextCard)
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
        await gameLoop(tableId, io)
      }


 


      async function gameLoop(tableId, io) {
        console.log('------- GAME LOOP -------');
        console.log('------- CURSOR -------');
        console.log('');
        console.log(rooms[tableId].cursor);
        console.log('');
        console.log('----------------------');
        let room = tableId
        let updateObj = {
          tableId,
          table: {
            actionSeat: null,
            seats: rooms[tableId].seats,
            dealerCards:{
              visibleCards: rooms[tableId].dealerCards.visibleCards,
            }
          },  
        };
        
        // Emit latest decision to clients
        io.in(room).emit('get_updated_table', updateObj);

        // Get next player
        let nextPlayer = await getNextPlayer(tableId)

        // If none, handle dealer turn
        if(!nextPlayer){
          console.log('DEALERS TURN');
          await handleDealerTurn(tableId, io)
          return
        } 

        // If some, handle player turn
        await handlePlayerTurn(tableId, nextPlayer, io)

      }
 


      //returns next player or false if all players have acted
      async function getNextPlayer(tableId){
        console.log('------- GETTING NEXT PLAYER -------');

        let nextPlayer
        if(rooms[tableId] && rooms[tableId].sortedActivePlayers.length){
          nextPlayer = rooms[tableId].sortedActivePlayers[0]
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
                await gameLoop(tableId, io) 
                return
              }



              for(let [key, handData] of playerHands){

                console.log('-=-=-=-=-=-');
                console.log(player);
                console.log(handData);
                console.log('-=-=-=-=-=-'); 
      
                if (handData.turnEnded) continue;
      
                // Create actionTimer 
                rooms[tableId].actionTimer = 5000;
        
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

                // If timer already exists, return without creating another one
                if (rooms[tableId].timerId) {
                  clearInterval(rooms[tableId].timerId)
                }
         
        
                // Create timer and store its id in the room object
                rooms[tableId].timerId = setInterval(async() => {
                  rooms[tableId].actionTimer -= 1000; // Decrement by 1 second
                  console.log('COUNTDOWN: ',rooms[tableId].actionTimer);
                  // If timer reaches 0, clear interval and emit a timeout event
                  if (rooms[tableId].actionTimer <= 0) {
                    clearInterval(rooms[tableId].timerId);
                    
                    console.log('TURN OVER');
                    // Set turnEnded to true for this hand
                    handData.turnEnded = true;
                    await gameLoop(tableId, io) 
                  } 
                }, 1000)
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
  
  
        if(rooms[tableId] && rooms[tableId].timerId){
          console.log('CLEARING TIMER');
          console.log('CLEARING TIMER');
          console.log('CLEARING TIMER');
          console.log('CLEARING TIMER');
          console.log('CLEARING TIMER');
          console.log('CLEARING TIMER');
          // Reset the timer whenever a player takes an action
          // 1. Clear the existing timer
          clearInterval(rooms[tableId].timerId);
          // 2. Reset the actionTimer value
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
 

        
        if(action === 'hit' ){
          playerHit(actionObj, io)
          
        }
        if(action === 'stay' ){
          playerStay(actionObj, io)
          
        }
        if(action === 'double' ){
          playerDouble(actionObj, io)
      
        }
        if(action === 'split' ){
          playerSplit(actionObj, io)
          
        }
        if(action === 'insurance' ){
          playerInsurance(actionObj, io)
        }

         
        await gameLoop(tableId, io) 
  
        console.log('--------------');
        console.log(`Handling action(${action}) for ${username} @room ${room}`);
        console.log('--------------');
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



        const drawnCardsAndDeck = await drawCards(drawObj)
        const {drawnCards, newDeck} = drawnCardsAndDeck

        console.log('------- newDeck -------');
        console.log(newDeck);
        console.log('------------------------');

        rooms[tableId].deck = newDeck

        // const newCard = await drawCards(drawObj)
        rooms[tableId].cursor += cardsToDraw
        currentHand.cards.push(...drawnCards);
        
 
      }

      // Handle player stay action
      async function playerStay(actionObj, io){
        const {tableId, action, seat, handId } = actionObj

      // Update hand to show no more decisions need to be made for the gameLoop
        let playersHand = rooms[tableId].seats[seat].hands[handId]
        playersHand.turnEnded = true

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
        await gameLoop(tableId, io);
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

        const drawnCardsAndDeck = await drawCards(drawObj)
        const {drawnCards, newDeck} = drawnCardsAndDeck

        console.log('------- newDeck -------');
        console.log(newDeck);
        console.log('------------------------');

        rooms[tableId].deck = newDeck

        // const newCard = await drawCards(drawObj)
        rooms[tableId].cursor += cardsToDraw
        currentHand.cards.push(...drawnCards);

        // Update hand to show no more decisions need to be made for the gameLoop
        let playersHand = rooms[tableId].seats[seat].hands[handId]
        playersHand.turnEnded = true
        rooms[tableId].seats[seat].hands[handId] = playersHand

        // End players turn
        // rooms[tableId].sortedFinishedPlayers.push(nextPlayer)
      }


      async function playerInsurance(actionObj, io){
        const {tableId, action, seat, handId } = actionObj

      }

      async function handleDealerTurn(tableId, io){
        console.log('HANDLING DEALER TURN');

        let room = tableId
        let hiddenCards = rooms[tableId].dealerCards.hiddenCards
        let visibleCards = rooms[tableId].dealerCards.visibleCards
        let otherCards = rooms[tableId].dealerCards.otherCards
        let newCards = [...visibleCards, ...hiddenCards, ...otherCards ]
        rooms[tableId].dealerCards.hiddenCards = []
        rooms[tableId].dealerCards.visibleCards = newCards
 
        // Emit update to clients
        let updateObj = {
          tableId,
          table: {
            actionSeat: null,
            seats: rooms[tableId].seats,
            dealerCards:{
              visibleCards: rooms[tableId].dealerCards.visibleCards,
            }
          },
        };
        
        io.in(room).emit('get_updated_table', updateObj);
  

        //Check current handSummary
        let dealerHand = await handSummary(newCards)
        //Check current best card combo value
        let bestDealerValue = bestValue(dealerHand.values);

        console.log(dealerHand);
        console.log(bestDealerValue);

        // if dealer has soft 17 or bestComboValue is less than 16, draw card
        while(dealerHand.softSeventeen || bestDealerValue <= 16){
          let cardsToDraw = 1
          let drawObj = {
            deck: rooms[tableId].deck,
            cardsToDraw,
            cursor: rooms[tableId].cursor
          } 
          // const drawnCards = await drawCards(drawObj)


          const drawnCardsAndDeck = await drawCards(drawObj)
          const {drawnCards, newDeck} = drawnCardsAndDeck
  
          console.log('------- newDeck -------');
          console.log(newDeck);
          console.log('------------------------');
  
          rooms[tableId].deck = newDeck
          newCards.push(...drawnCards)
      
          // Set new cursor point
          rooms[tableId].cursor++

          console.log('_*_*_*_*_*_*_*_*_*_*_*_**_');
          console.log('_*_*_*_*_*_*_*_*_*_*_*_**_');
          console.log('cardsToDraw:', cardsToDraw);
          console.log('NEW CURSOR:', rooms[tableId].cursor);
          console.log('_*_*_*_*_*_*_*_*_*_*_*_**_');
          console.log('_*_*_*_*_*_*_*_*_*_*_*_**_');
          
          // Re-calculate the dealer's hand summary and best value.
          dealerHand = await handSummary(newCards)
          bestDealerValue = bestValue(dealerHand.values);
        } 

        //END ROUND if value is above
        if(bestDealerValue >= 17 && dealerHand.softSeventeen === false){
          console.log('DEALER STAYS');
          rooms[tableId].dealerCards.handSummary = dealerHand
          rooms[tableId].dealerCards.bestValue = bestDealerValue
          endRound(tableId, io)
        }
      } 

 
  


      async function endRound(tableId, io) {

        console.log('------- END ROUND -------');

        let room = tableId
        let roundId = rooms[tableId]?.roundId
        let bestDealerValue = rooms[tableId].dealerCards.bestValue
        let finishedPlayers = rooms[tableId].sortedFinishedPlayers


        let updateObj = {
          tableId,
          table: {
            seats: rooms[tableId].seats,
            dealerCards:{
              visibleCards: rooms[tableId].dealerCards.visibleCards,
            }
          },
        };
        
         
    
        
        // Update table with latest info before ending the round
        io.in(room).emit('get_updated_table', updateObj);

        console.log('finishedPlayers:', finishedPlayers);

        if(!finishedPlayers.length){

        }
 

        //Iterate over each player and keep track of any winnings
        for(let player of finishedPlayers){
          let currentBalance = player.tableBalance
          let winnings = 0

           //Iterate over each player's hand 
          let playerHands = Object.entries(player.hands)
          for(let [key, handData] of playerHands){

            let cards = handData.cards
            let bet = handData.bet
            let playerHand = await handSummary(cards)
            let bestPlayerValue = bestValue(playerHand.values);


            // Determine the result of the hand and update the chips on table accordingly
            let result;
            let profitLoss
            if(bestPlayerValue === 21 && bestPlayerValue > bestDealerValue){
              console.log('BLACKJACK');
              result = 'BLACKJACK';
              profitLoss = bet * 1.5
              winnings += bet * 2.5
            } else if(bestDealerValue > 2 || bestPlayerValue > bestDealerValue){
              console.log('WIN');
              result = 'WIN';
              profitLoss = bet
              winnings += bet * 2
            } else if(bestPlayerValue === bestDealerValue){
              console.log('PUSH');
              result = 'PUSH';
              profitLoss = 0
              winnings += bet
            } else {
              console.log('LOSE');
              result = 'LOSE';
              profitLoss = -bet
              winnings += 0
            } 

 
  
            let handObj = {
              handId: key,
              cards: JSON.stringify(cards),
              result,
              profitLoss,
              winnings,
              userTableId: player.id
            }
            await gameController.savePlayerHand(handObj)


            console.log('^^^^^^^^^^^^^^^^');
            console.log('player: ', player);
            console.log('winnings: ', winnings);
            console.log('player.tableBalance: ',player.tableBalance);
            console.log('^^^^^^^^^^^^^^^^');


          
            // Display winnings or losses of each bet
            rooms[tableId].seats[player.seat].hands[key].bet += profitLoss

            console.log('^^^^^^^^^^^^^^^^');
            console.log('currentBet:');
            console.log(rooms[tableId].seats);
            console.log(rooms[tableId].seats[player.seat].hands[key].bet);
            console.log('^^^^^^^^^^^^^^^^');
  
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

    
          // Clear players seat and bet info, award any winnings
          currentBalance+=winnings
          player.tableBalance = currentBalance;   
          winnings = 0
          profitLoss = 0
          rooms[tableId].seats[player.seat].hands = {}
          rooms[tableId].seats[player.seat].cards = []
          rooms[tableId].seats[player.seat].pendingBet = 0
          rooms[tableId].seats[player.seat].currentBet = 0

 
          console.log('^^^^^^^^^^^^^^^^');
          console.log('new player.tableBalance: ',player.tableBalance);
          console.log('^^^^^^^^^^^^^^^^');


          // Add delay here
          await new Promise(resolve => setTimeout(resolve, 3000));


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





        // logic after hands have been awarded

        // save dealers cards to db
        let dealersCards = rooms[tableId].dealerCards.visibleCards
        dealersCards = dealersCards.flat(5)

        let handObj = {
          id:roundId,
          cards: JSON.stringify(dealersCards),
          active: false,
          nonce: rooms[tableId].nonce
        }


        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log(rooms[tableId].nonce);
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');
        console.log('^^^^^^^^^^^^^^^^');

        await gameController.saveDealerHand(handObj)
        // Reset the room for the next hand

        if(rooms[tableId] && rooms[tableId].forfeitedPlayers){
          let forfeitedPlayers = rooms[tableId].forfeitedPlayers
          for(let player of forfeitedPlayers){

            const {userId, seat } = player
            let userTableId = rooms[tableId].seats[seat].id
            let tableBalance = rooms[tableId].seats[seat].tableBalance

            console.log('^^^^^^^^^^^^^^^^');
            console.log('forfeitedPlayer: ',player);
            console.log('userId: ',userId);
            console.log('seat: ',seat);
            console.log(rooms[tableId].seats[seat]); 
            console.log('^^^^^^^^^^^^^^^^');


            // Remove the player from the room state
            if(rooms[tableId] && rooms[tableId].seats[seat]){
              delete rooms[tableId].seats[seat];
            }  

            let leaveSeatObj = {
              tableId,
              seat,
              userTableId,
              userId,
              tableBalance,
            }

            await gameController.leaveSeat(leaveSeatObj)
            io.in(tableId).emit('remove_player', leaveSeatObj);


          }

        }

        console.log('SETTING HAND IN PROGRESS TO FALSE');
        console.log('SETTING HAND IN PROGRESS TO FALSE');
        console.log('SETTING HAND IN PROGRESS TO FALSE');
        console.log('SETTING HAND IN PROGRESS TO FALSE');
        console.log('SETTING HAND IN PROGRESS TO FALSE');

 
        rooms[tableId].dealerCards = {
          hiddenCards: [],
          visibleCards: [],
          otherCards: [],
          handSummary: null,
          bestValue: null
        }

        rooms[tableId].forfeitedPlayers = []
        rooms[tableId].sortedFinishedPlayers = []
        rooms[tableId].handInProgress = false
        rooms[tableId].actionSeat = null
           
        
        updateObj = {
          tableId,
          table: { 
            handInProgress: false,
            seats: rooms[tableId].seats,
            dealerCards:{
              visibleCards: rooms[tableId].dealerCards.visibleCards,
            }

          },
        };
        console.log('BEFORE TIMEOUT');
        console.log('BEFORE TIMEOUT');
        await new Promise(resolve => setTimeout(resolve, 1000));

        io.in(room).emit('get_updated_table', updateObj);

        console.log('AFTER TIMEOUT');
        console.log('AFTER TIMEOUT');

          
        return 
 
      }

  });
};
