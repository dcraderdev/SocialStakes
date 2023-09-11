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

const { drawCards, handSummary, bestValue } = require('./cardController');

const {
  roomInit,
  connections,
  rooms,
  disconnectTimeouts,
  disconnectTimes,
  lastPayouts,
} = require('../global');

let emitCustomMessage = require('../utils/emitCustomMessage');
let emitUpdatedTable = require('../utils/emitUpdatedTable');
let emitMainPageWinnerMessage = require('../utils/emitMainPageWinnerMessage');

let { countdownInterval } = require('../global');

const blackjackController = {
  anyBetsLeft(tableId) {
    if (!rooms[tableId]) return false;

    // Iterate over all seats in the room to check for any remaining bets
    for (let seat in rooms[tableId].seats) {
      if (rooms[tableId].seats[seat].pendingBet > 0) {
        return true; // If there is a bet, return true
      }
    }
    // If no bets are found, return false
    return false;
  },

  stopCountdownToDeal(io, tableId) {
    let room = tableId;
    let countdownObj = { dealCardsTimeStamp: 0, tableId };

    rooms[tableId].dealCardsTimeStamp = null;
    io.in(room).emit('countdown_update', countdownObj);
  },

  stopActionTimer(io, tableId) {
    let room = tableId;
    let countdownObj = { actionEndTimeStamp: 0, tableId };

    rooms[tableId].actionEndTimeStamp = null;
    io.in(room).emit('countdown_update', countdownObj);
  },
  

  async handleLeaveBlackjackTable(io, table, playerSeatObj) {
    let player = playerSeatObj;
    let tableId = table.tableId;
    let seat = playerSeatObj.seat;

    let userId = playerSeatObj.userId;
    let userTableId = playerSeatObj.id;

    let anyPlayersAfter = rooms[tableId].sortedActivePlayers.some(
      (sortedPlayer) => sortedPlayer.seat < seat
    );
    let anyPlayersBefore = rooms[tableId].sortedActivePlayers.some(
      (sortedPlayer) => sortedPlayer.seat > seat
    );
    let leaveOnPlayerTurn = rooms[tableId].actionSeat === seat;
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
      rooms[tableId].forfeitedPlayers.push(player);
      player.forfeit = true;
      clearTimeout(disconnectTimeouts[userId]);
      delete disconnectTimeouts[userId];
      delete disconnectTimes[userId];

      let currentTimer = rooms[tableId].actionEndTimeStamp;
      let leaveSeatObj = { tableId, seat, currentTimer };

      io.to(tableId).emit('player_forfeit', leaveSeatObj);

      //if no players left to act, end the round
      if (!anyPlayersBefore && !anyPlayersAfter) {
        await this.endRound(io, tableId);
        return;
      }

      if (leaveOnPlayerTurn) {
        clearInterval(rooms[tableId].timerId);
        await this.gameLoop(io, tableId);
        return;
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
      if (!leaveSeat) {
        return;
      }
      console.log('<><><><><><><>test 1  <><><><><><><><');
      console.log('<><><><><><><><><><><><><><><');
      console.log('<><><><><><><><><><><><><><><');
      // console.log(rooms[tableId]);
      console.log(rooms[tableId].actionSeat);
      console.log('<><><><><><><><><><><><><><><');
      console.log('<><><><><><><><><><><><><><><');
      console.log('<><><><><><><><><><><><><><><');

      emitUpdatedTable(io, tableId);
      io.in(userId).emit('player_leave', leaveSeatObj);

      // if theres other bets continue timer, otherwise cancel
      if (!this.anyBetsLeft(tableId)) {
        this.stopCountdownToDeal(io, tableId);
      }
    }

    return;
  },

  // starts game of blackjack for multiple players
  async dealCards(io, tableId) {
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

    let sortedSeatsObj = sortedSeats.map((seat) => ({
      id: seat.id,
      currentBet: seat.currentBet,
    }));

    // console.log('------- ROUND ID -------');
    // console.log(sortedSeatsObj);
    // console.log(roundId);
    // console.log('------------------------');

    // Create hand for each active player
    const handIds = await gameController.createHands(sortedSeatsObj, roundId);
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
    let dealerHand = await handSummary([dealerVisibleCard, dealerHiddenCard]);
    let bestDealerValue = await bestValue(dealerHand.values);
    rooms[tableId].dealerCards.handSummary = dealerHand;
    rooms[tableId].dealerCards.bestValue = bestDealerValue;

    // console.log(rooms[tableId].dealerCards);

    let isAce = cardConverter[dealerVisibleCard].value === 11;

    let messageObj = {
      conversationId: rooms[tableId].conversationId,
      content: 'Dealer shows: ',
      tableId,
      cards: dealerCards.visibleCards,
    };


    await emitCustomMessage(io, messageObj);

    if (isAce) {
      // socket.emit('offer_insurance', tableId);

      io.in(room).emit('offer_insurance', tableId);

      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 10 seconds
      // socket.emit('remove_insurance_offer', tableId);

      io.in(room).emit('remove_insurance_offer', tableId);
    }

    // if dealer has blackjack, skip to end of round
    if (bestDealerValue === 21) {
      await this.handleDealerBlackjack(io, tableId);

      await this.endRound(io, tableId);
    } else {
      await this.gameLoop(io, tableId);
    }
  },

  async gameLoop(io, tableId) {
    // console.log('------- GAME LOOP -------');

    console.log('<><><><><><><>test 2  <><><><><><><><');
    console.log('<><><><><><><><><><><><><><><');
    console.log('<><><><><><><><><><><><><><><');
    // console.log(rooms[tableId]);
    console.log(rooms[tableId].actionSeat);
    console.log('<><><><><><><><><><><><><><><');
    console.log('<><><><><><><><><><><><><><><');
    console.log('<><><><><><><><><><><><><><><');
    // // Emit latest decision to clients
    emitUpdatedTable(io, tableId);

    // Get next player
    let nextPlayer = this.getNextPlayer(tableId);

    // If none, handle dealer turn
    if (!nextPlayer) {
      await this.handleDealerTurn(io, tableId);
      return;
    }

    // If some, handle player turn
    await this.handlePlayerTurn(io, tableId, nextPlayer );

    // cirlce back into gameLoop
    await this.gameLoop(io, tableId);
  },


  getNextPlayer(tableId) {
    let sortedActivePlayers = rooms?.[tableId]?.sortedActivePlayers;
    let nextPlayer;
      if (rooms[tableId] && sortedActivePlayers.length) {
        nextPlayer = sortedActivePlayers[sortedActivePlayers.length - 1];
      }
      if (nextPlayer) {
        return nextPlayer;
      } else {
        return false;
      }
  },




  async handlePlayerTurn(io, tableId, player) {
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
        if (cards.length === 1) {
          await this.playerHit({ tableId, seat: player.seat, handId: key });
          return;
        }
        let playerHand = await handSummary(cards);
        let playerBestValue = await bestValue(playerHand.values);
        // Assign handSummary to hand
        handData.summary = playerHand;

        let valuesStr = playerHand.values.join(',');

        let messageObj = {
          conversationId: rooms[tableId].conversationId,
          content: `${player.username} shows: ${valuesStr}`,
          tableId,
          cards,
        };

        if (playerHand.blackjack) {
          messageObj.content = `${player.username} has Blackjack!`;
        }
        if (playerHand.busted) {
          messageObj.content = `${player.username} has busted!`;
        }
        if (playerBestValue === 21) {
          messageObj.content = `${player.username} has 21! `;
        }


        await emitCustomMessage( io, messageObj);

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
        const actionDuration = 5000; // 5 seconds
        rooms[tableId].actionEndTimeStamp = Math.ceil(Date.now() + actionDuration);

        // Set action seat
        rooms[tableId].actionSeat = player.seat;

        // Emit update to clients
        let updateObj = {
          tableId,
          table: {
            actionSeat: player.seat,
            actionHand: key,
            actionEndTimeStamp: rooms[tableId].actionEndTimeStamp,
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
            const remainingTime = Math.ceil(
              (rooms[tableId].actionEndTimeStamp - Date.now()) / 1000
            );

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

              let messageObj = {
                conversationId: rooms[tableId].conversationId,
                content: `${player.username} has run out of time and stays with ${valuesStr}.`,
                tableId,
                cards,
              };

              await emitCustomMessage( io, messageObj);

              // Set turnEnded to true for this hand
              handData.turnEnded = true;
              resolve(); // Resolve the promise to let the game loop continue
            }
          }, 1000);
        });
      }
      return;
    

  },



  async playerHit(actionObj) {
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
  },

  // Handle player stay action
  async playerStay(actionObj) {
    const { tableId, action, seat, handId } = actionObj;

    // Update hand to show no more decisions need to be made for the gameLoop
    let playersHand = rooms[tableId].seats[seat].hands[handId];
    playersHand.turnEnded = true;
    return;
  },

  async playerSplit(io, actionObj) {
    const { tableId, action, seat, handId } = actionObj;
    let room = tableId;
    let userTableId = rooms[tableId].seats[seat].id;
    let roundId = rooms[tableId].roundId;
    let currentSeat = rooms[tableId].seats[seat];

    // Create new hand for the split
    const newHand = await gameController.createHand(userTableId, roundId);
    let newHandId = newHand.id;

    if (!newHand) {
      await gameLoop(io, tableId);
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
  },

  async playerDouble(io, actionObj) {
    const { tableId, action, seat, handId } = actionObj;
    let currentSeat = rooms[tableId].seats[seat];
    let currentHand = rooms[tableId].seats[seat].hands[handId];
    let currentBet = rooms[tableId].seats[seat].hands[handId].bet;
    let username = rooms[tableId].seats[seat].username
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

    let playerHand = await handSummary(currentHand.cards);
    let valuesStr = playerHand.values.join(',');

    let messageObj = {
      conversationId: rooms[tableId].conversationId,
      content: `${username} shows: ${valuesStr}`,
      tableId,
      cards: currentHand.cards,
    };


    await emitCustomMessage( io, messageObj);

    // Update hand to show no more decisions need to be made for the gameLoop
    let playersHand = rooms[tableId].seats[seat].hands[handId];
    playersHand.turnEnded = true;
    rooms[tableId].seats[seat].hands[handId] = playersHand;
    return;

    // End players turn
    // rooms[tableId].sortedFinishedPlayers.push(nextPlayer)
  },



async handleDealerBlackjack(io, tableId) {
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
},




async handleDealerTurn(io, tableId) {
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
    let dealerHand = await handSummary(newCards);
    let valuesStr = dealerHand.values.join(',');

    let messageObj = {
      conversationId: rooms[tableId].conversationId,
      content: `Dealer shows: ${valuesStr}`,
      tableId,
      cards: dealerCards.visibleCards,
    };

    await emitCustomMessage(io, messageObj);

    await this.endRound(io, tableId);
    return;
  }

  // Handle dealer's strategy
  let stop = false;
  while (!stop) {
    // Calculate hand summary and best value
    let dealerHand = await handSummary(newCards);
    let bestDealerValue = await bestValue(dealerHand.values);

    let valuesStr = dealerHand.values.join(',');

    let messageObj = {
      conversationId: rooms[tableId].conversationId,
      content: `Dealer shows: ${valuesStr}`,
      tableId,
      cards: dealerCards.visibleCards,
    };

    await emitCustomMessage(io, messageObj);
    await new Promise((resolve) => setTimeout(resolve, 1500));

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

    messageObj.content = `Dealer hits.`;


    await emitCustomMessage(io, messageObj);

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
  await this.endRound(io, tableId);
},


async determineResult(
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
},

async processForfeitedPlayers(io, tableId) {
  let bestDealerValue = rooms[tableId].dealerCards.bestValue;

  if (rooms[tableId] && rooms[tableId].forfeitedPlayers) {
    let forfeitedPlayers = rooms[tableId].forfeitedPlayers;
    for (let player of forfeitedPlayers) {
      let { totalWinnings } = await this.calculateAndSavePlayerHand(
        io,
        player,
        bestDealerValue,
        tableId
      );

      this.updateAndClearPlayerData(player, totalWinnings);

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

      console.log('<><><><><><><>test 3  <><><><><><><><');
      console.log('<><><><><><><><><><><><><><><');
      console.log('<><><><><><><><><><><><><><><');
      // console.log(rooms[tableId]);
      console.log(rooms[tableId].actionSeat);
      console.log('<><><><><><><><><><><><><><><');
      console.log('<><><><><><><><><><><><><><><');
      console.log('<><><><><><><><><><><><><><><');
      emitUpdatedTable(io, tableId)

      await gameController.leaveSeat(leaveSeatObj);
      io.in(userId).emit('player_leave', leaveSeatObj);
    }
  }
},

updateAndClearPlayerData(player, totalWinnings) {
  player.tableBalance += totalWinnings;
  player.hands = {};
  player.cards = [];
  player.pendingBet = 0;
  player.currentBet = 0;
  player.insurance = {
    accepted: false,
    bet: 0,
  };
},


async calculateAndSavePlayerHand(
  io, 
  player,
  bestDealerValue,
  tableId
) {
  let room = tableId;
  let totalWinnings = 0;
  let totalProfitLoss = 0;
  let username = player.username


  let playerHands = Object.entries(player.hands);
  for (let [key, handData] of playerHands) {
    let { cards, bet } = handData;
    let playerHand = await handSummary(cards);
    let bestPlayerValue = await bestValue(playerHand.values);

    // Determine the result of any insurance
    const { insuranceWinnings, insuranceProfitLoss, hasInsuranceBet } =
      this.handleInsurancePayout(tableId, player.seat);

    // Determine the result of the hand
    const { result, profitLoss, winnings } = await this.determineResult(
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

    // display the winners to the room
    if (totalProfitLoss > 0) {
      let messageObj = {
        conversationId: rooms[tableId].conversationId,
        content: `${username} has won $${totalProfitLoss}!`,
        tableId,
        cards,
        game: 'Blackjack',
      };

      await emitCustomMessage(io, messageObj);
    }
    await emitMainPageWinnerMessage(
      io,
      tableId,
      player,
      handData,
      totalWinnings
    );

    //Update the hand's bet to show profit/loss
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
},



resetRoomForNextHand(tableId) {
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
  rooms[tableId].actionEndTimeStamp = null;
},


handleInsurancePayout(tableId, seat) {
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
},

async endRound(io, tableId) {
  let room = tableId;
  let bestDealerValue = rooms[tableId].dealerCards.bestValue;
  let finishedPlayers = rooms[tableId].sortedFinishedPlayers;
  rooms[tableId].actionSeat = null

  this.stopActionTimer(io, tableId);
  // Update table with latest info before ending the round

  emitUpdatedTable(io, tableId)

  if (!finishedPlayers.length) {
    // Do something
  }

  // Iterate over each player and keep track of any winnings
  for (let player of finishedPlayers) {
    // Calculate and save player hand results

    // console.log('------- player -------');
    // console.log(player);
    // console.log('----------------------');

    let { totalWinnings } = await this.calculateAndSavePlayerHand(
      io,
      player,
      bestDealerValue,
      tableId
    );

    // console.log('------- totalWinnings -------');
    // console.log(totalWinnings);
    // console.log('----------------------');

    // Update and clear player data
    this.updateAndClearPlayerData(player, totalWinnings);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Display any winnings going to tableBalance

    console.log('<><><><><><><>test 6  <><><><><><><><');
    console.log('<><><><><><><><><><><><><><><');
    console.log('<><><><><><><><><><><><><><><');
    // console.log(rooms[tableId]);
    console.log(rooms[tableId].actionSeat);
    console.log('<><><><><><><><><><><><><><><');
    console.log('<><><><><><><><><><><><><><><');
    console.log('<><><><><><><><><><><><><><><');
    emitUpdatedTable(io, tableId)
  }

  // Save dealer's cards to db and reset the room for the next hand
  let dealerCards = rooms[tableId].dealerCards;
  let visibleCards = dealerCards.visibleCards;
  let hiddenCards = dealerCards.hiddenCards;
  let otherCards = dealerCards.otherCards;

  // Combine all dealer's cards
  let dealersCards = [...visibleCards, ...hiddenCards, ...otherCards].flat(
    5
  );
  // let dealersCards = rooms[tableId].dealerCards.visibleCards.flat(5);

  let handObj = {
    id: rooms[tableId]?.roundId,
    cards: JSON.stringify(dealersCards),
    active: false,
    nonce: rooms[tableId].nonce,
  };

  await gameController.saveDealerHand(handObj);

  // Check for any players that have left midgame and remove them
  await this.processForfeitedPlayers(io, tableId);

  this.resetRoomForNextHand(tableId);

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
},



};

module.exports = {
  blackjackController,
};
