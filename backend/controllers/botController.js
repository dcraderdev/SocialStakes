const {
  User,
  Game,
  Table,
  UserTable,
  ServerSeed,
  Message,
  Round,
  Hand,
  GameSession,
  Conversation,
  UserConversation,
  Action,
  Friendship,
  Pot,
  UserPot,
} = require('../db/models');

const {
  roomInit,
  connections,
  rooms,
  disconnectTimeouts,
  disconnectTimes,
  lastPayouts,
} = require('../global');

const { gameController } = require('./gameController');
const { cardConverter } = require('./cardConverter');
const setDealCardsTimeStamp = require('../utils/setDealCardsTimeStamp');
const { blackjackController } = require('./blackjackController');

const botController = {
  buyInAmount: 5000,

  async handleBotInit() {
    let bots = [
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a83',
        username: 'Jeff Ma',
      },
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a84',
        username: 'John Chang',
      },
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a85',
        username: 'Bill Kaplan',
      },
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a86',
        username: 'Mike Aponte',
      },
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a87',
        username: 'Jane Willis',
      },
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a88',
        username: 'Seymon Dukach',
      },
    ];

    let bellagioTableId = 'be11a610-7777-7777-7777-7be11a610777';

    let updatedTable = await gameController.getTableById(bellagioTableId);
    if (!updatedTable) return;

    if (!rooms[bellagioTableId]) {
      rooms[bellagioTableId] = roomInit();
      rooms[bellagioTableId].tableId = bellagioTableId;
      rooms[bellagioTableId].gameSessionId = updatedTable.gameSessions[0].id;
      rooms[bellagioTableId].blockHash = updatedTable.gameSessions[0].blockHash;
      rooms[bellagioTableId].decksUsed = updatedTable.Game.decksUsed;
      rooms[bellagioTableId].shufflePoint = updatedTable.shufflePoint;
      rooms[bellagioTableId].conversationId = updatedTable.Conversation.id;
      rooms[bellagioTableId].chatName = updatedTable.Conversation.chatName;
      rooms[bellagioTableId].gameType = updatedTable.Game.shortName;
      rooms[bellagioTableId].Game = updatedTable.Game;
    }

    bots.forEach(async (user, index) => {
      let tableId = bellagioTableId;
      let seat = index + 1;
      let amount = this.buyInAmount;

      await gameController.removeUserFromTables(user.id);

      const takeSeat = await gameController.takeSeat(
        tableId,
        seat,
        user,
        amount
      );

      if (takeSeat) {
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

        rooms[tableId].seats[seat] = takeSeatObj;
      }
    });
  },

  async startBotRound(io, tableId) {
    const room = rooms[tableId];
    const seats = room.seats;

    // iterate over bots
    Object.values(seats).map(async (seat, index) => {
      await this.handleBotBetDecision(io, tableId, seat);
    });
  },

  async handleBotBetDecision(io, tableId, seat) {
    // check chip stack
    // check card count
    // make bet

    const room = rooms[tableId];

    let minBet = rooms[tableId].Game.minBet;
    let hasBalance = seat.tableBalance > minBet;

    let bet = minBet;

    if (!hasBalance) {
      let room = tableId;
      let userId = seat.userId;
      let userTableId = seat.id;
      let amount;

      const currUser = await User.findByPk(userId);
      let balanceNotInPlay = currUser.balance;

      if (balanceNotInPlay > this.buyInAmount) {
        amount = this.buyInAmount;
      } else if (amount === 0) {
        return;
      } else {
        amount = balanceNotInPlay;
      }

      const seatObj = { tableId, seat, userId, amount, userTableId };
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
    }

    // If handInProgress, dont add the bet
    if (room.handInProgress) {
      return;
    }

    // Update pendingBet in the rooms object
    seat.pendingBet += bet;
    seat.tableBalance -= bet;

    if (!rooms[tableId].dealCardsTimeStamp) {
      setDealCardsTimeStamp(io, tableId);
    }

    const betObj = { bet, tableId, seat: seat.seat };

    io.in(tableId).emit('new_bet', betObj);
  },

  // await blackjackController.playerHit(actionObj) {
  //   await blackjackController.playerStay(actionObj) {
  //     await blackjackController.playerSplit(io, actionObj) {
  //       await blackjackController.playerDouble(io, actionObj) {
  // // const { tableId, seat, handId } = actionObj;

  getActionForHand(playerHandValue, dealerCardValue, canSplit = false, enoughFunds = false) {
    if (playerHandValue <= 8) {
      return 'hit';
    }

    if (playerHandValue === 20) {
      return 'stay';
    } 

    if (playerHandValue === 9) {
      if (dealerCardValue >= 3 && dealerCardValue <= 6  && enoughFunds) {
        return 'double';
      } else {
        return 'hit';
      }
    }

    if (playerHandValue === 10) {
      if (dealerCardValue <= 9  && enoughFunds) {
        return 'double';
      } else {
        return 'hit';
      }
    }

    if (playerHandValue === 11) {
      if (dealerCardValue <= 10 && enoughFunds) {
        return 'double';
      } else {
        return 'hit';
      }
    }

    if (playerHandValue >= 12 && playerHandValue <= 16) {
      if (dealerCardValue <= 6) {
        return 'stay';
      } else {
        return 'hit';
      }
    }

    if (playerHandValue >= 17) return 'stay';

    if (canSplit && enoughFunds) {

      return 'split';
      
    } else {
      return 'stay';
    }
    
  },

  getCardValueFromConverter(card) {
    const modCard = card % 51;
    return cardConverter[modCard].value;
  },

  computeHandValue(cards) {
    let total = 0;
    let aces = 0;

    for (const card of cards) {
      const value = this.getCardValueFromConverter(card);
      total += value;
      if (value === 11) aces++;
    }

    while (total > 21 && aces) {
      total -= 10;
      aces--;
    }

    return total;
  },

  async handleBotActions(io, tableId) {
    const room = rooms[tableId];
    let actionSeat = room.actionSeat;
    let actionHand = room.actionHand;
    if (!actionHand || !actionSeat) return;
    let currentHand = room.seats[actionSeat].hands[actionHand];
    let currentHandValues =
      room.seats[actionSeat].hands[actionHand].summary.values;

    let playerFunds = room.seats[actionSeat].tableBalance;
    let currentBet = currentHand.bet;

    let dealerCards = room.dealerCards;

    const dealerVisibleCard = dealerCards.visibleCards[0];
    const dealerCardValue = this.getCardValueFromConverter(dealerVisibleCard);
    const playerHandValue = this.computeHandValue(currentHand.cards);

    // Check if the hand can be split (both cards have the same value)
    const canSplit =
      currentHand.cards.length === 2 &&
      this.getCardValueFromConverter(currentHand.cards[0]) ===
        this.getCardValueFromConverter(currentHand.cards[1]);

    const enoughFunds = playerFunds >= currentBet;

    let action = this.getActionForHand(
      playerHandValue,
      dealerCardValue,
      canSplit,
      enoughFunds
    );

    let actionObj = {
      tableId,
      seat: actionSeat,
      handId: actionHand,
    };

    console.log('action--->', action);

    switch (action) {
      case 'hit':
        console.log('hit');
        await blackjackController.playerHit(actionObj);
        break;
      case 'stay':
        console.log('stay');
        await blackjackController.playerStay(actionObj);
        break;
      case 'split':
        console.log('split');
        await blackjackController.playerSplit(io, actionObj);
        break;
      case 'double':
        console.log('double');
        await blackjackController.playerDouble(io, actionObj);
        break;
      default:
        console.error('Invalid action returned from getActionForHand');
    }

    // // const { tableId, seat, handId } = actionObj;

    // currentHand
    // {
    //   cards: [ 16, 47 ],
    //   bet: 300,
    //   turnEnded: false,
    //   summary: {
    //     blackjack: false,
    //     softSeventeen: false,
    //     busted: false,
    //     values: [ 15 ]
    //   }
    // }

    // dealerCards
    // {
    //   naturalBlackjack: false,
    //   hiddenCards: [ 45 ],
    //   visibleCards: [ 34 ],
    //   otherCards: [],
    //   handSummary: {
    //     blackjack: false,
    //     softSeventeen: false,
    //     busted: false,
    //     values: [ 18 ]
    //   },
    //   bestValue: 18
    // }

    // console.log('=-=-=-=-=-=-=-=-=-=-=');
    // console.log('=-=-=-=-=-=-=-=-=-=-=');
    // console.log('=-=-=-=-=-=-=-=-=-=-=');
    // console.log(actionSeat);
    // console.log(actionHand);
    // console.log(currentHand);
    // console.log(dealerCards);
    // console.log('=-=-=-=-=-=-=-=-=-=-=');
    // console.log('=-=-=-=-=-=-=-=-=-=-=');
    // console.log('=-=-=-=-=-=-=-=-=-=-=');

    // get current actionseat
    // get currentHand that is being played
    // evaluate hand
    // evaluate dealer hand
    // make decision
    // emit decision
  },
};

module.exports = { botController };
