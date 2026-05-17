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
    minBet: 5,
    maxBet: 25,
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
    maxBet: 100,
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
    maxBet: 500,
    actionTimer: 15,
  },
  {
    id: 'blackjack_6_deck_low_stakes_single',
    gameType: 'single_blackjack',
    variant: 'American 21',
    shortName: 'Blackjack',
    decksUsed: 6,
    active: true,
    minNumPlayers: 1,
    maxNumPlayers: 1,
    smallBlind: 0,
    bigBlind: 0,
    minBet: 5,
    maxBet: 200,
    actionTimer: 15,
  },
];

const DEFAULT_TABLES = [
  {
    gameId: 'blackjack_6_deck_low_stakes_multi',
    tableName: 'Pacific - Low Stakes',
    shufflePoint: 180,
  },
  {
    gameId: 'blackjack_6_deck_mid_stakes_multi',
    tableName: 'Cascades - Mid Stakes',
    shufflePoint: 180,
  },
  {
    gameId: 'blackjack_6_deck_high_stakes_multi',
    tableName: 'Golden Gate - High Stakes',
    shufflePoint: 180,
  },
  {
    gameId: 'blackjack_6_deck_low_stakes_single',
    tableName: 'Solo - American 21',
    shufflePoint: 180,
  },
];

async function ensureGames() {
  for (const game of DEFAULT_GAMES) {
    await Game.upsert(game);
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

    let created = 0;

    for (const tableData of DEFAULT_TABLES) {
      const existing = await Table.findOne({
        where: { tableName: tableData.tableName, active: true },
        attributes: ['id'],
      });

      if (existing) continue;

      console.log(`[boot] Creating default table: ${tableData.tableName}`);
      await createTableWithDependencies(tableData);
      created++;
    }

    if (created > 0) {
      console.log(`[boot] Created ${created} default table(s).`);
    }
  } catch (err) {
    console.error('[boot] ensureDefaultTables error:', err);
  }
}

module.exports = ensureDefaultTables;
