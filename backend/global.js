const roomInit = () => {
  return {
    seats: {},
    roundId: null,
    actionSeat: null,
    actionHand: null,
    actionTimer: null,
    dealCardsTimeStamp: null,
    actionEndTimeStamp: null,
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

const connections = {};
const rooms = {};
const disconnectTimeouts = {};
const disconnectTimes = {};
let countdownInterval = null
 
let lastPayouts = [
  {
    createdAt: 1693856698676,
    gameType: 'Blackjack',
    username: 'Pine',
    bet: 1,
    payout: 2,
  },
  {
    createdAt: 1693856698676,
    gameType: 'Blackjack',
    username: 'bigtree',
    bet: 1,
    payout: 0,
  },
  {
    createdAt: 1693856698676,
    gameType: 'Blackjack',
    username: 'Pine',
    bet: 10,
    payout: 20,
  },
  {
    createdAt: 1693856698676,
    gameType: 'Blackjack',
    username: 'bigtree',
    bet: 1,
    payout: 2,
  },
  {
    createdAt: 1693856698676,
    gameType: 'Blackjack',
    username: 'Pine',
    bet: 1,
    payout: 0,
  },
  {
    createdAt: 1693856698676,
    gameType: 'Blackjack',
    username: 'bigtree',
    bet: 1,
    payout: 0,
  },
  {
    createdAt: 1693856698676,
    gameType: 'Blackjack',
    username: 'Pine',
    bet: 1,
    payout: 2,
  },
];

module.exports = {
  roomInit,
  connections,
  rooms,
  disconnectTimeouts,
  disconnectTimes,
  lastPayouts
};
