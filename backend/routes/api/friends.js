const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { User, Friendship, UserTable, Table, Game } = require('../../db/models');
const { friendController } = require('../../controllers/friendController');
const { historyController } = require('../../controllers/historyController');
const { connections } = require('../../global');
const { Op } = require('sequelize');

function isOnline(userId) {
  return !!(connections[userId] && Object.keys(connections[userId]).length > 0);
}

// GET /api/friends/me - All accepted friends with online + table status
router.get('/me', requireAuth, async (req, res, next) => {
  const { user } = req;
  const friendData = await friendController.getUserFriends(user.id);
  if (!friendData) return res.json({ friends: {}, incomingRequests: {}, outgoingRequests: {} });

  const friendIds = Object.values(friendData.friends).map(f => f.friend.id);

  let tablesByUser = {};
  if (friendIds.length) {
    const activeTables = await UserTable.findAll({
      where: { userId: { [Op.in]: friendIds }, active: true },
      include: [{ model: Table, attributes: ['id', 'tableName', 'gameId'] }],
      attributes: ['userId', 'tableId'],
    });
    activeTables.forEach(ut => {
      tablesByUser[ut.userId] = ut.Table
        ? { id: ut.tableId, tableName: ut.Table.tableName, gameId: ut.Table.gameId }
        : null;
    });
  }

  const friends = {};
  for (const [id, friend] of Object.entries(friendData.friends)) {
    friends[id] = {
      ...friend,
      isOnline: isOnline(friend.friend.id),
      currentTable: tablesByUser[friend.friend.id] || null,
    };
  }

  return res.json({
    friends,
    incomingRequests: friendData.incomingRequests,
    outgoingRequests: friendData.outgoingRequests,
    rejectedRequests: friendData.rejectedRequests,
  });
});

// GET /api/friends/me/online - Only online friends
router.get('/me/online', requireAuth, async (req, res, next) => {
  const { user } = req;
  const friendData = await friendController.getUserFriends(user.id);
  if (!friendData) return res.json({ friends: {} });

  const friends = {};
  for (const [id, friend] of Object.entries(friendData.friends)) {
    if (isOnline(friend.friend.id)) {
      friends[id] = { ...friend, isOnline: true };
    }
  }

  return res.json({ friends });
});

// POST /api/friends/add - Send friend request by username or email
router.post('/add', requireAuth, async (req, res, next) => {
  const { user } = req;
  const { username, email } = req.body;

  if (!username && !email) {
    return res.status(400).json({ message: 'username or email is required' });
  }

  const where = username ? { username } : { email };
  const recipient = await User.scope('currentUser').findOne({ where });

  if (!recipient) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (recipient.id === user.id) {
    return res.status(400).json({ message: 'Cannot send a friend request to yourself' });
  }

  const result = await friendController.sendFriendRequest({
    userId: user.id,
    username: user.username,
    recipientId: recipient.id,
    recipientUsername: recipient.username,
  });

  if (!result) {
    return res.status(400).json({ message: 'Friend request could not be sent' });
  }

  return res.status(200).json({
    friendship: result.friendship,
    recipient: { id: recipient.id, username: recipient.username },
  });
});

// GET /api/friends/activity?limit=50&cursor=ISO - Activity feed of friends
router.get('/activity', requireAuth, async (req, res, next) => {
  try {
    const { user } = req;
    const { limit, cursor } = req.query;
    const data = await historyController.getFriendActivity(user.id, { limit, cursor });
    return res.json(data);
  } catch (e) {
    next(e);
  }
});

// GET /api/friends/leaderboard?period=week|month|all
router.get('/leaderboard', requireAuth, async (req, res, next) => {
  try {
    const { user } = req;
    const period = ['week', 'month', 'all'].includes(req.query.period)
      ? req.query.period
      : 'week';
    const data = await historyController.getFriendsLeaderboard(user.id, period);
    return res.json(data);
  } catch (e) {
    next(e);
  }
});

// GET /api/friends/suggestions - Suggested users to add
router.get('/suggestions', requireAuth, async (req, res, next) => {
  try {
    const { user } = req;
    const suggestions = await historyController.getFriendSuggestions(user.id);
    return res.json({ suggestions });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/friends/:id - Remove a friendship by friendship ID
router.delete('/:id', requireAuth, async (req, res, next) => {
  const { user } = req;
  const { id: friendshipId } = req.params;

  const friendship = await Friendship.findByPk(friendshipId);
  if (!friendship) {
    return res.status(404).json({ message: 'Friendship not found' });
  }

  if (friendship.user1Id !== user.id && friendship.user2Id !== user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const friendId =
    friendship.user1Id === user.id ? friendship.user2Id : friendship.user1Id;

  await friendController.removeFriend(user.id, { friendshipId, friendId });

  return res.json({ message: 'Friend removed', friendshipId, friendId });
});

module.exports = router;
