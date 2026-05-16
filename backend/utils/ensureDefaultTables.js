const bcrypt = require('bcryptjs');
const {
  User,
  Table,
  Game,
  GameSession,
  ServerSeed,
  Conversation,
} = require('../db/models');

const {
  fetchLatestBlock,
  generateSeed,
} = require('../controllers/cardController');

const SYSTEM_USER_ID = 'e10d8de4-f4c7-4d28-9324-56aa9c000001';

const DEFAULT_GAMES = [
  {
    id: 'blackjack_6_deck_low_stakes_multi',
    gameType: 'multi_blackjack',
    variant: 'American 21',
    shortName: 'Blackjack',
    decksUsed: 6,
    active: true,
    minNumPlayers: 1,
    maxNumPlayers: 6,
    smallBlind: 0,
    bigBlind: 0,
    minBet: 1,
    maxBet: 500,
    actionTimer: 15,
  },
  {
    id: 'blackjack_4_deck_low_stakes_multi',
    gameType: 'multi_blackjack',
    variant: 'American 21',
    shortName: 'Blackjack',
    decksUsed: 4,
    active: true,
    minNumPlayers: 1,
    maxNumPlayers: 6,
    smallBlind: 0,
    bigBlind: 0,
    minBet: 1,
    maxBet: 200,
    actionTimer: 15,
  },
  {
    id: 'blackjack_6_deck_mid_stakes_multi',
    gameType: 'multi_blackjack',
    variant: 'American 21',
    shortName: 'Blackjack',
    decksUsed: 6,
    active: true,
    minNumPlayers: 1,
    maxNumPlayers: 6,
    smallBlind: 0,
    bigBlind: 0,
    minBet: 25,
    maxBet: 12500,
    actionTimer: 15,
  },
  {
    id: 'blackjack_4_deck_mid_stakes_multi',
    gameType: 'multi_blackjack',
    variant: 'American 21',
    shortName: 'Blackjack',
    decksUsed: 4,
    active: true,
    minNumPlayers: 1,
    maxNumPlayers: 6,
    smallBlind: 0,
    bigBlind: 0,
    minBet: 1,
    maxBet: 5000,
    actionTimer: 15,
  },
  {
    id: 'blackjack_6_deck_high_stakes_multi',
    gameType: 'multi_blackjack',
    variant: 'American 21',
    shortName: 'Blackjack',
    decksUsed: 6,
    active: true,
    minNumPlayers: 1,
    maxNumPlayers: 6,
    smallBlind: 0,
    bigBlind: 0,
    minBet: 100,
    maxBet: 50000,
    actionTimer: 15,
  },
];

const DEFAULT_TABLES = [
  {
    gameId: 'blackjack_6_deck_low_stakes_multi',
    tableName: 'Pacific - American 21',
    shufflePoint: 180,
  },
  {
    gameId: 'blackjack_4_deck_low_stakes_multi',
    tableName: 'Sierra - American 21',
    shufflePoint: 136,
  },
  {
    gameId: 'blackjack_6_deck_mid_stakes_multi',
    tableName: 'Cascades - American 21',
    shufflePoint: 180,
  },
  {
    gameId: 'blackjack_4_deck_mid_stakes_multi',
    tableName: 'Redwood - American 21',
    shufflePoint: 136,
  },
  {
    gameId: 'blackjack_6_deck_high_stakes_multi',
    tableName: 'Golden Gate - American 21',
    shufflePoint: 180,
  },
];

async function ensureGames() {
  for (const game of DEFAULT_GAMES) {
    await Game.findOrCreate({
      where: { id: game.id },
      defaults: game,
    });
  }
}

async function ensureSystemUser() {
  await User.findOrCreate({
    where: { id: SYSTEM_USER_ID },
    defaults: {
      id: SYSTEM_USER_ID,
      firstName: 'House',
      lastName: 'Dealer',
      username: 'HouseDealer',
      email: 'house@socialstakes.internal',
      hashedPassword: bcrypt.hashSync('housedealerpassword123', 10),
      balance: 0,
    },
  });
}

async function createTableWithDependencies(tableData) {
  const { gameId, tableName, shufflePoint } = tableData;

  const table = await Table.create({
    gameId,
    userId: SYSTEM_USER_ID,
    shufflePoint,
    tableName,
    active: true,
    private: false,
    tableBalance: 0,
  });

  if (!table) return null;

  let blockHash;
  try {
    blockHash = await fetchLatestBlock();
  } catch (e) {
    blockHash = '0000000000000000000000000000000000000000000000000000000000000000';
  }

  const gameSession = await GameSession.create({
    tableId: table.id,
    blockHash,
    nonce: '1',
  });

  if (!gameSession) return null;

  const serverSeed = generateSeed();
  await ServerSeed.create({
    gameSessionId: gameSession.id,
    serverSeed,
  });

  await Conversation.create({
    tableId: table.id,
    chatName: tableName,
    isDirectMessage: false,
    hasDefaultChatName: false,
  });

  return table;
}

async function ensureDefaultTables() {
  try {
    await ensureGames();
    await ensureSystemUser();

    const existingCount = await Table.count({
      where: { active: true },
      include: [
        {
          model: Game,
          where: { gameType: 'multi_blackjack' },
          required: true,
        },
      ],
    });

    if (existingCount > 0) return;

    console.log('[boot] No active multi_blackjack tables found — seeding defaults…');

    for (const tableData of DEFAULT_TABLES) {
      await createTableWithDependencies(tableData);
    }

    console.log(`[boot] Created ${DEFAULT_TABLES.length} default tables.`);
  } catch (err) {
    console.error('[boot] ensureDefaultTables error:', err.message);
  }
}

module.exports = ensureDefaultTables;
