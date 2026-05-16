// backend/routes/api/friends.js
const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Event, User, Friendship, UserTable } = require('../../db/models');
const { Op, Sequelize } = require('sequelize');
const router = express.Router();


// GET /api/friends/suggestions
// Returns ranked list of users the current user is not already friends with.
// Ranking: friends-of-friends (weighted by mutual count) > table co-players > recently joined
router.get('/suggestions', requireAuth, async (req, res, next) => {
  const userId = req.user.id;

  try {
    // All existing relationship IDs (friends + pending)
    const existingFriendships = await Friendship.findAll({
      where: {
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
      },
      attributes: ['user1Id', 'user2Id', 'status'],
    });

    const knownIds = new Set([userId]);
    const acceptedFriendIds = new Set();

    existingFriendships.forEach((f) => {
      const otherId = f.user1Id === userId ? f.user2Id : f.user1Id;
      knownIds.add(otherId);
      if (f.status === 'accepted') acceptedFriendIds.add(otherId);
    });

    const scoreMap = {}; // userId -> { score, mutualCount, reason }

    // --- Strategy 1: Friends-of-friends ---
    if (acceptedFriendIds.size > 0) {
      const fofFriendships = await Friendship.findAll({
        where: {
          status: 'accepted',
          [Op.or]: [
            { user1Id: { [Op.in]: [...acceptedFriendIds] } },
            { user2Id: { [Op.in]: [...acceptedFriendIds] } },
          ],
        },
        attributes: ['user1Id', 'user2Id'],
      });

      fofFriendships.forEach((f) => {
        const u1 = f.user1Id;
        const u2 = f.user2Id;

        if (acceptedFriendIds.has(u1) && !knownIds.has(u2)) {
          if (!scoreMap[u2]) scoreMap[u2] = { score: 0, mutualCount: 0, reason: 'mutual' };
          scoreMap[u2].mutualCount += 1;
          scoreMap[u2].score += 10;
        }

        if (acceptedFriendIds.has(u2) && !knownIds.has(u1)) {
          if (!scoreMap[u1]) scoreMap[u1] = { score: 0, mutualCount: 0, reason: 'mutual' };
          scoreMap[u1].mutualCount += 1;
          scoreMap[u1].score += 10;
        }
      });
    }

    // --- Strategy 2: Co-table players ---
    try {
      const userTables = await UserTable.findAll({
        where: { userId },
        attributes: ['tableId'],
      });

      if (userTables.length > 0) {
        const tableIds = userTables.map((ut) => ut.tableId);

        const coPlayers = await UserTable.findAll({
          where: {
            tableId: { [Op.in]: tableIds },
            userId: { [Op.notIn]: [...knownIds] },
          },
          attributes: ['userId'],
        });

        coPlayers.forEach((cp) => {
          const uid = cp.userId;
          if (!scoreMap[uid]) scoreMap[uid] = { score: 0, mutualCount: 0, reason: 'table' };
          scoreMap[uid].score += 5;
        });
      }
    } catch (_) {
      // UserTable query is best-effort; skip if it fails
    }

    // --- Strategy 3: Recently joined ---
    const recentUsers = await User.findAll({
      where: { id: { [Op.notIn]: [...knownIds] } },
      order: [['createdAt', 'DESC']],
      limit: 20,
      attributes: ['id', 'username', 'rank'],
    });

    recentUsers.forEach((u, i) => {
      if (!scoreMap[u.id]) {
        scoreMap[u.id] = { score: Math.max(0, 3 - i * 0.1), mutualCount: 0, reason: 'recent' };
      }
    });

    const candidateIds = Object.keys(scoreMap);
    if (!candidateIds.length) {
      return res.status(200).json({ suggestions: [] });
    }

    const candidateUsers = await User.findAll({
      where: { id: { [Op.in]: candidateIds } },
      attributes: ['id', 'username', 'rank'],
    });

    const suggestions = candidateUsers
      .map((u) => ({
        id: u.id,
        username: u.username,
        rank: u.rank || 0,
        mutualCount: scoreMap[u.id].mutualCount,
        reason: scoreMap[u.id].reason,
        score: scoreMap[u.id].score,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return res.status(200).json({ suggestions });
  } catch (err) {
    return next(err);
  }
});


// GET /api/friends/activity
router.get('/activity', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const cursor = req.query.cursor;

    const friendships = await Friendship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
      },
      attributes: ['user1Id', 'user2Id'],
    });

    const friendIds = friendships.map((f) =>
      f.user1Id === userId ? f.user2Id : f.user1Id
    );

    if (!friendIds.length) {
      return res.json({ events: [], nextCursor: null });
    }

    const where = {
      userId: { [Op.in]: friendIds },
      ...(cursor && { createdAt: { [Op.lt]: new Date(cursor) } }),
    };

    const events = await Event.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'rank'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });

    const nextCursor =
      events.length === limit
        ? events[events.length - 1].createdAt.toISOString()
        : null;

    return res.json({ events, nextCursor });
  } catch (err) {
    next(err);
  }
});


module.exports = router;
