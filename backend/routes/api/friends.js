const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Event, Friendship, User } = require('../../db/models');
const { Op } = require('sequelize');

const router = express.Router();

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
