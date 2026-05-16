const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { statController } = require('../../controllers/statController');

router.get('/leaderboard', requireAuth, async (req, res, next) => {
  const { user } = req;
  const period = req.query.period || 'week';

  if (!['week', 'month', 'all'].includes(period)) {
    return res.status(400).json({ message: 'Invalid period. Use week, month, or all.' });
  }

  const data = await statController.getFriendsLeaderboard(user.id, period);
  return res.json(data);
});

module.exports = router;
