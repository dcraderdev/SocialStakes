const { gameController } = require('./controllers/gameController');
const { drawCards, handSummary } = require('./controllers/cardController');


module.exports = function (io) {
  const rooms = {};
  let turnTimers = {};

  const disconnectTimeouts = {};

  const roomInit = () => {
    return {
      seats: { },
      actionSeat: null,
      actionTimer: null,
      countdownTimer: 0,
      countdownRemaining: 0, 
      handInProgress: false, 
      gameSessionId: null,
      serverSeed: null,
      nonce: null,
      deck: null, 
      cursor: 0,
      dealerCards: {
        hiddenCards: [],
        visibleCards: [],
        otherCards: [],
        handSummary: null
      },
      messages: [],
      sortedActivePlayers: [],
      sortedFinishedPlayers: []
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
            user: {
              username: 'Room',
              id: 1,
            },
            content: `${username} has reconnected.`,
            room: tableId,
          };
  
          io.in(tableId).emit('new_message', messageObj);
          io.in(tableId).emit('player_reconnected', {seat, tableId, timer});
        }
      }
    }
    


    socket.on('disconnect', async () => {
      let timer = 5000 // 15 seconds, adjust as needed
      console.log(`User ${username} disconnected`);
      const userTables = await gameController.getUserTables(userId);
      if(userTables){
        for(let table of userTables){
          let tableId = table.tableId
          let seat = table.seat
          let messageObj = {
            user: {
              username: 'Room',
              id: 1,
            },
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
            io.in(tableId).emit('remove_player', {seat, tableId});
          }
        }
        await gameController.removeUserFromTables(userId);

      }, timer); 
      // isReconnecting[userId] = true;
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


      if (!updatedTable) {
        // TODO: Create logic for creating a new game
      }


        
      // If the room doesnt exist create a new room
      if (!rooms[tableId]) {
        rooms[tableId] = roomInit()
        rooms[tableId].gameSessionId = updatedTable.gameSessions[0].id
        rooms[tableId].decksUsed = updatedTable.Game.decksUsed
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
      
      const { room, seat, user, tableBalance } = seatObj;
      let tableId = room

      console.log('--------------');
      console.log(`leave_seat`);
      console.log(room);
      console.log('--------------');

      // Remove the player from the room state
      if(rooms[tableId] && rooms[tableId].seats[seat]){
        delete rooms[tableId].seats[seat];
      }


      const leaveSeat = await gameController.leaveSeat(tableId, seat, user, tableBalance)

      if(!leaveSeat) return

      const leaveSeatObj = {
        seat,
        tableId,
        userId:user.id,
        tableBalance,
      }

      console.log(leaveSeatObj);
      io.in(room).emit('player_leave', leaveSeatObj);

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

      // Start a new countdown if one isn't already running
      if (!rooms[tableId].countdownTimer) {
        
        
        rooms[tableId].countdownTimer = setInterval(() => {
          countdownRemaining -= 1000;
          rooms[tableId].countdownRemaining = countdownRemaining;
          if (countdownRemaining <= 0) {
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

      console.log('--------------');
      console.log(`Removing all bets received from ${username} @room ${room}`);
      console.log('--------------');
    });



    socket.on('add_funds', async (seatObj) => {
      const {tableId, seat, userId, amount } = seatObj
      let room = tableId


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


      // io.in(userId).emit('message', messageObj);

      console.log('--------------');
      console.log(`Adding funds(${amount}) for ${username} @room ${room}`);
      console.log('--------------');
    });


    socket.on('deal_cards', async (tableId) => {
      let room = tableId

      let dealObj = {
        tableId,
        gameSessionId: rooms[tableId].gameSessionId,
        blockHash: rooms[tableId].blockHash,
        nonce: rooms[tableId].nonce,
        decksUsed: rooms[tableId].decksUsed
      }
      // generate cards and create Round entry in db
      const deckandRoundId = await gameController.dealCards(dealObj)
      if(!deckandRoundId){
        return
      }
      const {roundId, deck} = deckandRoundId
      // Assign deck and roundId to room
      rooms[tableId].deck = deck
      rooms[tableId].roundId = roundId

      // Calculate number of cards to draw
      // numSeats with currentBets + cards for dealer
      // Sort the seats by seat number and only include those with a current bet
      let sortedSeats = Object.entries(rooms[tableId].seats)
        .filter(([i, seat]) => seat.currentBet > 0)
        .sort(([seatNumberA], [seatNumberB]) => seatNumberA - seatNumberB)
        .map(([i, seat]) => seat);

        console.log(sortedSeats);
        let userTableIds = sortedSeats.map(seat=>seat.id)  
        console.log('=-=-=-=-');
        console.log(userTableIds);
        console.log(roundId);
        console.log('=-=-=-=-');

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
      const drawnCards = await drawCards(drawObj)
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
                      seat.hands[`${handIds[i]}`] = []
                    }
                    seat.hands[`${handIds[i]}`].push(nextCard);
                }
                // Distribute the first card to the dealer
                rooms[tableId].dealerCards.push(drawnCards.shift());
              }
      }
      // Set new cursor point, setDealers cards
      rooms[tableId].cursor += cardsToDraw 
      rooms[tableId].dealer.visibleCards = rooms[tableId].dealerCards[1]
      rooms[tableId].dealer.hiddenCards = rooms[tableId].dealerCards[0] 

      let updateObj = {
        tableId,
        table: {
          seats: rooms[tableId].seats,
        },
        dealerCards:{
          hiddenCard: null,
          visibleCard: rooms[tableId].dealerVisibleCard,
        }
      };
      console.log(updateObj);
      io.in(room).emit('get_updated_table', updateObj);
      // io.in(userId).emit('message', messageObj);
      console.log('--------------');
      console.log(`Dealing cards @room ${room}`);
      console.log('--------------');
    });


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
        // generate cards and create Round entry in db
        const deckandRoundId = await gameController.dealCards(dealObj)
        if(!deckandRoundId){
          return
        }
        const {roundId, deck} = deckandRoundId
        // Assign deck to room
        rooms[tableId].deck = deck


        console.log('------- rooms[tableId].seats -------');
        console.log(rooms[tableId].seats);
        console.log('------------------------');



  
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
        const drawnCards = await drawCards(drawObj)
        console.log(drawnCards);
        console.log(drawnCards);
        console.log(drawnCards);
        console.log(drawnCards);
        console.log(drawnCards);
        console.log(drawnCards);
        console.log(drawnCards);
        console.log(drawnCards);
        console.log(drawnCards);
        console.log(drawnCards);
        if(handIds && drawnCards){  
                // Distribute the cards 
                for(let j = 0; j < 2; j++){
                  for (let i = 0; i < sortedSeats.length; i++) {
                    let seat = sortedSeats[i];
  
                    console.log('-=-=-=-=-=-');
                    console.log('%$%$%$%$%$%$%$%$%$%');
                    console.log('%$%$%$%$%$%$%$%$%$%');
                    console.log('%$%$%$%$%$%$%$%$%$%');
                    console.log('%$%$%$%$%$%$%$%$%$%');
                    console.log(seat);
                    console.log('%$%$%$%$%$%$%$%$%$%');
                    console.log('%$%$%$%$%$%$%$%$%$%');
                    console.log('%$%$%$%$%$%$%$%$%$%');
                    console.log('%$%$%$%$%$%$%$%$%$%'); 
                    console.log('%$%$%$%$%$%$%$%$%$%');
                    console.log('-=-=-=-=-=-');
                    // Get the next card and remove it from the drawnCards array
                    let nextCard = drawnCards.shift()
                    seat.cards.push(nextCard);
                      // Create a newHand inside the handsObj in case we need to split during the hand
                      // Use the map we created to get the handIds
                      if(!seat.hands[`${handIds[i]}`]){
                        seat.hands[`${handIds[i]}`] = {
                          cards: [],
                          bet: null,
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


      //returns next player or false if all players have acted
      async function getNextPlayer(tableId){
        let nextPlayer
        if(rooms[tableId] && rooms[tableId].sortedActivePlayers.length){
          nextPlayer = rooms[tableId].sortedActivePlayers.pop()
        } 
        if(nextPlayer){
          return nextPlayer
        } else {
          return false
        }
      }

      //returns next player or false if all players have acted
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

        console.log(dealerHand);

        
        // if dealer has soft 17 or less than 16
        if(dealerHand.softSeventeen || dealerHand.value <= 16){
          
          let cardsToDraw = 1
  
          let drawObj = {
            deck: rooms[tableId].deck,
            cardsToDraw,
            cursor: rooms[tableId].cursor
          } 
          const drawnCards = await drawCards(drawObj)
          rooms[tableId].dealerCards.otherCards.push(drawnCards)
          // Set new cursor point, setDealers cards
          rooms[tableId].cursor += cardsToDraw 
          handleDealerTurn(tableId, io)
        }

        if(dealerHand.value >= 17){
          //END ROUND
          console.log('DEALER STAYS');
          rooms[tableId].dealerCards.handSummary = dealerHand

          // await gameController.saveDealerHand(handObj)
          endRound(tableId, io)
        }
      } 

 
      async function gameLoop(tableId, io) {
        console.log('------- GAME LOOP -------');
        let room = tableId

        let nextPlayer = await getNextPlayer(tableId)
        if(!nextPlayer){
          console.log('DEALERS TURN');
          await handleDealerTurn(tableId, io)
          return
          //dealers turn
        } 

        console.log('-=-=-=-=-=-');
        console.log('PLAYERS TURN');
        console.log(nextPlayer);
        console.log(rooms[tableId].seats[nextPlayer.seat]);  
        console.log(nextPlayer.seat);  
        console.log('-=-=-=-=-=-'); 

        // Create actionTimer 
        rooms[tableId].actionTimer = 2000;

        // Set action seat
        rooms[tableId].actionSeat = nextPlayer.seat
 
        // Emit update to clients
        let updateObj = {
          tableId,
          table: {
            actionSeat: nextPlayer.seat,
            actionTimer: rooms[tableId].actionTimer,
            seats: rooms[tableId].seats,
            dealerCards:{
              visibleCards: rooms[tableId].dealerCards.visibleCards,
            }
          },
        };

        io.in(room).emit('get_updated_table', updateObj);





        // Create timer and store its id in the room object
        rooms[tableId].timerId = setInterval(() => {
          rooms[tableId].actionTimer -= 1000; // Decrement by 1 second
          console.log('COUNTDOWN: ',rooms[tableId].actionTimer);
          // If timer reaches 0, clear interval and emit a timeout event
          if (rooms[tableId].actionTimer <= 0) {
            clearInterval(rooms[tableId].timerId);
            
            console.log('TURN OVER');
            console.log('TURN OVER');
            console.log('TURN OVER');
            console.log('TURN OVER');
            gameLoop(tableId, io) 
            rooms[tableId].sortedFinishedPlayers.push(nextPlayer)
            // io.in(room).emit('player_timeout', {tableId, seat: nextPlayer.seat});
          }
        }, 1000)
      }






      async function endRound(tableId, io) {
        let room = tableId

        // Update table with latest info before ending the round
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

        console.log(rooms[tableId].dealerCards.handSummary);

        let dealerHand = rooms[tableId].dealerCards.handSummary
        let finsihedPlayers = rooms[tableId].sortedFinishedPlayers

        for(let player of finsihedPlayers){
          let currentBalance = player.tableBalance
          let winnings = 0

          let playerHands = Object.entries(player.hands)
          for(let [key, handData] of playerHands){
            let cards = handData.cards
            let bet = handData.bet
            let playerHand = await handSummary(cards)


            console.log('^^^^^^^^^^^^^^^^');
            console.log('^^^^^^^^^^^^^^^^');
            console.log(cards);
            console.log(JSON.stringify(cards));
            console.log(rooms[tableId].roundId);
            console.log(player);
            console.log('^^^^^^^^^^^^^^^^');
            console.log('^^^^^^^^^^^^^^^^');
            
            // Determine the result of the hand and update the bet accordingly
            let result;
            let profitLoss
            if(playerHand.value === 21 && playerHand.value > dealerHand.value){
              console.log('BLACKJACK');
              result = 'BLACKJACK';
              profitLoss = bet * 1.5
              winnings += bet * 2.5
            } else if(dealerHand.value > 21 || playerHand.value > dealerHand.value){
              console.log('WIN');
              result = 'WIN';
              profitLoss = bet
              winnings += bet * 2
            } else if(playerHand.value === dealerHand.value){
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
              profitLoss
            }

            await gameController.savePlayerHand(handObj)
            
 
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


          // Clear players seat, award any winnings



          currentBalance+=winnings
          player.tableBalance = currentBalance;
          // player.hands = {}
          // player.cards = []
          // player.pendingBet = 0
          // player.currentBet = 0

          // rooms[tableId].seats[seat].hands = {}
          // rooms[tableId].seats[seat].cards = []


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
        for (let seat in rooms[tableId].seats) {
          rooms[tableId].seats[seat].hands = {}
          rooms[tableId].seats[seat].cards = []
          rooms[tableId].seats[seat].pendingBet = 0
          rooms[tableId].seats[seat].currentBet = 0
        }

        rooms[tableId].dealerCards = {
          hiddenCards: [],
          visibleCards: [],
          otherCards: [],
          handSummary: null
        }
           


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

        setTimeout(() => {
          io.in(room).emit('get_updated_table', updateObj);
        }, 500);

         

      }

  });
};
