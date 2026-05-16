const crypto = require('crypto');
const { Op } = require('sequelize');
const {
  User,
  Table,
  UserTable,
  ServerSeed,
  Round,
  Hand,
  GameSession,
  Friendship,
  Game,
} = require('../db/models');

const { cardConverter } = require('./cardConverter');
const { generateDeck } = require('./cardController');

const SUIT_SYMBOLS = { spade: '♠', heart: '♥', diamond: '♦', club: '♣' };

function cardLabel(idx) {
  const mod = idx % 52;
  const c = cardConverter[mod];
  if (!c) return `?${idx}`;
  return `${c.rank}${SUIT_SYMBOLS[c.suit]}`;
}

function parseCards(cardsStr) {
  try {
    const arr = JSON.parse(cardsStr);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// result filter: exclude null AND empty string (default is '' in schema)
const RESULT_FILTER = {
  [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }],
};

async function seedDemoHands(userId) {
  // Bail early if user already has hands (prevents double-seeding on concurrent requests)
  const existingUt = await UserTable.findOne({ where: { userId }, attributes: ['id'] });
  if (existingUt) {
    const existingHand = await Hand.findOne({
      where: { userTableId: existingUt.id, result: RESULT_FILTER },
      attributes: ['id'],
    });
    if (existingHand) return;
  }

  // Find any active table — don't filter by gameType since seeded value is 'multi_blackjack'
  const table = await Table.findOne({
    where: { active: true },
    include: [{ model: Game, attributes: ['decksUsed', 'gameType'] }],
    order: [['createdAt', 'ASC']],
  });
  if (!table) return;

  // Find or create a UserTable for this user at that table (seat 9 = history-only slot)
  let ut = await UserTable.findOne({ where: { userId, tableId: table.id } });
  if (!ut) {
    ut = await UserTable.create({
      userId,
      tableId: table.id,
      seat: 9,
      tableBalance: 1000,
      currentBet: 0,
      pendingBet: 0,
      active: false,
    });
  }

  // Results match the game engine's uppercase format
  const scenarios = [
    { result: 'WIN',       pl:  100, cards: '[8, 21]' },
    { result: 'LOSE',      pl: -100, cards: '[5, 18]' },
    { result: 'WIN',       pl:  150, cards: '[12, 21]' },
    { result: 'LOSE',      pl: -100, cards: '[6, 19, 14]' },
    { result: 'WIN',       pl:  200, cards: '[11, 24]' },
    { result: 'PUSH',      pl:    0, cards: '[8, 21]' },
    { result: 'LOSE',      pl:  -50, cards: '[3, 16]' },
    { result: 'WIN',       pl:  100, cards: '[10, 23]' },
    { result: 'WIN',       pl:  150, cards: '[12, 24]' },
    { result: 'LOSE',      pl: -200, cards: '[7, 20, 15]' },
    { result: 'WIN',       pl:  100, cards: '[9, 22]' },
    { result: 'LOSE',      pl: -100, cards: '[4, 17]' },
    { result: 'WIN',       pl:  300, cards: '[11, 24]' },
    { result: 'LOSE',      pl:  -75, cards: '[2, 15, 19]' },
    { result: 'PUSH',      pl:    0, cards: '[7, 20]' },
  ];

  const createdHandIds = [];
  const timestamps = [];

  for (let i = 0; i < scenarios.length; i++) {
    const sc = scenarios[i];
    // Spread over last 28 days so curve has meaningful shape
    const daysBack = Math.floor((i / (scenarios.length - 1)) * 28);
    const ts = new Date();
    ts.setDate(ts.getDate() - daysBack);
    ts.setHours(10 + (i % 12), i * 3 % 60, 0, 0);

    const round = await Round.create({ tableId: table.id, active: false, nonce: i + 1 });

    const hand = await Hand.create({
      userTableId: ut.id,
      roundId: round.id,
      cards: sc.cards,
      result: sc.result,
      profitLoss: sc.pl,
      insuranceBet: false,
      initialBet: Math.abs(sc.pl) || 100,
    });

    createdHandIds.push(hand.id);
    timestamps.push(ts);
  }

  // Back-date createdAt via raw SQL so the bankroll curve spreads across days
  const schema = process.env.NODE_ENV === 'production' ? `"${process.env.SCHEMA}".` : '';
  for (let i = 0; i < createdHandIds.length; i++) {
    const ts = timestamps[i].toISOString();
    await Hand.sequelize.query(
      `UPDATE ${schema}"Hands" SET "createdAt" = :ts, "updatedAt" = :ts WHERE id = :id`,
      { replacements: { ts, id: createdHandIds[i] } }
    );
  }
}

const historyController = {
  async getHistoryStats(userId, days = 30, _seeded = false) {
    const since = daysAgo(days);

    const userTables = await UserTable.findAll({
      where: { userId },
      attributes: ['id'],
    });

    if (!userTables.length && !_seeded) {
      await seedDemoHands(userId);
      return this.getHistoryStats(userId, days, true);
    }

    const utIds = userTables.map((ut) => ut.id);

    const hands = utIds.length ? await Hand.findAll({
      where: {
        userTableId: { [Op.in]: utIds },
        createdAt: { [Op.gte]: since },
        result: RESULT_FILTER,
      },
      attributes: ['result', 'profitLoss', 'createdAt'],
    }) : [];

    if (!hands.length && !_seeded) {
      await seedDemoHands(userId);
      return this.getHistoryStats(userId, days, true);
    }

    const handsPlayed = hands.length;
    const netPL = hands.reduce((s, h) => s + (h.profitLoss || 0), 0);
    const wins = hands.filter((h) => {
      const r = (h.result || '').toUpperCase();
      return r === 'WIN' || r === 'BLACKJACK' || r.startsWith('WIN');
    }).length;
    const winRate = handsPlayed ? (wins / handsPlayed) * 100 : 0;
    const pls = hands.map((h) => h.profitLoss || 0);
    const biggestWin = pls.length ? Math.max(0, ...pls) : 0;
    const biggestLoss = pls.length ? Math.min(0, ...pls) : 0;

    // Bankroll curve: cumulative P&L per day over the requested range
    const dayMap = {};
    for (let i = days - 1; i >= 0; i--) {
      const key = daysAgo(i).toISOString().slice(0, 10);
      dayMap[key] = 0;
    }
    for (const h of hands) {
      const key = new Date(h.createdAt).toISOString().slice(0, 10);
      if (key in dayMap) dayMap[key] += h.profitLoss || 0;
    }
    let running = 0;
    const curve = Object.values(dayMap).map((delta) => {
      running += delta;
      return running;
    });

    return { handsPlayed, netPL, winRate, biggestWin, biggestLoss, curve };
  },

  async getHandHistory(userId, limit = 50, _seeded = false) {
    const userTables = await UserTable.findAll({
      where: { userId },
      attributes: ['id', 'tableId'],
      include: [{ model: Table, attributes: ['tableName'] }],
    });

    if (!userTables.length && !_seeded) {
      await seedDemoHands(userId);
      return this.getHandHistory(userId, limit, true);
    }

    const utMap = {};
    for (const ut of userTables) {
      utMap[ut.id] = ut.Table?.tableName || 'Table';
    }
    const utIds = Object.keys(utMap);

    const hands = utIds.length ? await Hand.findAll({
      where: {
        userTableId: { [Op.in]: utIds },
        result: RESULT_FILTER,
      },
      order: [['createdAt', 'DESC']],
      limit,
      attributes: ['id', 'userTableId', 'roundId', 'cards', 'result', 'profitLoss', 'initialBet', 'createdAt'],
    }) : [];

    if (!hands.length && !_seeded) {
      await seedDemoHands(userId);
      return this.getHandHistory(userId, limit, true);
    }

    return hands.map((h) => {
      const cardArr = parseCards(h.cards);
      const cardStr = cardArr.map(cardLabel).join(' ');
      return {
        id: h.id,
        time: new Date(h.createdAt).toLocaleString('en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
        }),
        table: utMap[h.userTableId] || 'Table',
        cards: cardStr || '—',
        result: h.result,
        delta: h.profitLoss || 0,
        initialBet: h.initialBet || 0,
        roundId: h.roundId,
      };
    });
  },

  async getFriendsLeaderboard(userId) {
    const since = daysAgo(7);

    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
        status: 'accepted',
      },
      attributes: ['user1Id', 'user2Id'],
    });

    const friendIds = friendships.map((f) =>
      f.user1Id === userId ? f.user2Id : f.user1Id
    ).filter(Boolean);

    const allIds = [userId, ...friendIds];

    const rows = [];
    for (const uid of allIds) {
      const uts = await UserTable.findAll({ where: { userId: uid }, attributes: ['id'] });
      const utIds = uts.map((ut) => ut.id);
      let netPL = 0;
      if (utIds.length) {
        const hands = await Hand.findAll({
          where: {
            userTableId: { [Op.in]: utIds },
            createdAt: { [Op.gte]: since },
            result: RESULT_FILTER,
          },
          attributes: ['profitLoss'],
        });
        netPL = hands.reduce((s, h) => s + (h.profitLoss || 0), 0);
      }
      const user = await User.findByPk(uid, { attributes: ['id', 'username'] });
      if (user) rows.push({ id: uid, name: user.username, delta: netPL, isMe: uid === userId });
    }

    rows.sort((a, b) => b.delta - a.delta);
    return rows.slice(0, 10);
  },

  async verifyHand(handId, userId) {
    const hand = await Hand.findByPk(handId, {
      include: [{ model: Round, attributes: ['id', 'nonce', 'cards'] }],
    });
    if (!hand) return null;

    // Confirm the hand belongs to this user
    const ut = await UserTable.findOne({
      where: { id: hand.userTableId, userId },
      attributes: ['id', 'tableId'],
    });
    if (!ut) return null;

    const table = await Table.findByPk(ut.tableId, {
      attributes: ['id', 'tableName', 'gameId'],
      include: [{ model: Game, attributes: ['decksUsed'] }],
    });
    if (!table) return null;

    const gameSession = await GameSession.findOne({
      where: { tableId: ut.tableId },
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'blockHash', 'nonce'],
    });
    if (!gameSession) return null;

    const serverSeedRow = await ServerSeed.findOne({
      where: { gameSessionId: gameSession.id },
      attributes: ['serverSeed'],
    });

    const serverSeed = serverSeedRow?.serverSeed || '';
    const blockHash = gameSession.blockHash || '';
    const nonce = hand.Round?.nonce ?? 1;
    const decksUsed = table?.Game?.decksUsed ?? 1;

    const combinedHash = crypto
      .createHash('sha256')
      .update(serverSeed + blockHash + String(nonce))
      .digest('hex');

    let derivedDeck = [];
    try {
      derivedDeck = generateDeck(serverSeed, blockHash, nonce, decksUsed);
    } catch (e) {
      derivedDeck = [];
    }

    const handCards = parseCards(hand.cards);
    const dealerCards = parseCards(hand.Round?.cards);

    return {
      handId: hand.id,
      tableName: table?.tableName || 'Table',
      serverSeed,
      blockHash,
      nonce,
      combinedHash,
      deck: derivedDeck.slice(0, 52).map(cardLabel),
      handCards: handCards.map(cardLabel),
      dealerCards: dealerCards.map(cardLabel),
      result: hand.result,
      delta: hand.profitLoss,
    };
  },
};

module.exports = { historyController };
