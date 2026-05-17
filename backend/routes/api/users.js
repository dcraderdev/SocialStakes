// backend/routes/api/users.js
const express = require('express');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors, validateSignup , validateQueryParameters} = require('../../utils/validation');
const { json, Op } = require('sequelize');
const db = require('../../db/models');
const { historyController } = require('../../controllers/historyController');
const { inviteController } = require('../../controllers/inviteController');
const { friendController } = require('../../controllers/friendController');
const router = express.Router();



// Sign up
// need to make sure that the correct CSRF token
// is being sent with each request that requires protection
router.post('/', validateSignup, async (req, res, next) => {

  let errors = {}
  const { email, password, username } = req.body;
  const firstName = req.body.firstName || username;
  const lastName = req.body.lastName || username;
  const verifyEmail = await User.findOne({where:{email:email}})
  const verifyUsername = await User.findOne({where:{username:username}})

  if (verifyEmail) errors.username = "User with that username already exists"
  if (verifyUsername) errors.email = "User with that email already exists"
                      
      
  if(errors.username || errors.email){
    // const err = new Error("User already exists");
    const err = {}
    err.status = 403;
    err.statusCode = 403
    err.errors = errors

    return next(err)
  }
  let user
  if(!errors.username && !errors.email){
    user = await User.signup({email,username,password,firstName,lastName,});
    const token = await setTokenCookie(res, user);

    // If signup included an invite code, redeem it to auto-friend the sender
    const { inviteCode } = req.body;
    if (inviteCode) {
      try {
        const invite = await inviteController.redeemInvite(inviteCode, user.id);
        if (invite) {
          await friendController.sendFriendRequest({
            userId: invite.senderId,
            recipientId: user.id,
            username: 'inviter',
            recipientUsername: user.username,
          });
          await friendController.acceptFriendRequest({
            userId: user.id,
            recipientId: invite.senderId,
            username: user.username,
            recipientUsername: 'inviter',
          });
        }
      } catch (inviteErr) {
        console.error('[signup] Invite redemption failed:', inviteErr.message);
      }
    }

    return res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      balance: user.balance,
      token: token,
    });
  }
  return res.status(200).json({what:'whaaaat'});
 

});


// Get all Users
router.get('/', validateQueryParameters, async (req, res, next) => {

  let where = {};

  const page = req.query.page;
  const size = req.query.size;
  let limit = size || 20;
  let offset = limit * (page - 1) || 0;

  let options = {
    where,
    limit: limit,
    offset: offset,
  };
  const allUsers = await User.findAll(options);
  if (!allUsers) {
    const err = new Error('allUsers not found');
    err.statusCode = 404;
    err.status = 404;
    return next(err);
  }
  return res.status(200).json({ Users: allUsers,page,size });
});

// Search users by username or email (fuzzy)
router.get('/search', requireAuth, async (req, res, next) => {
  const { q } = req.query;
  const { user } = req;

  if (!q || q.trim().length < 2) {
    return res.status(200).json({ users: [] });
  }

  try {
    const users = await User.findAll({
      where: {
        [Op.and]: [
          { id: { [Op.ne]: user.id } },
          {
            [Op.or]: [
              { username: { [Op.iLike]: `%${q.trim()}%` } },
              { email: { [Op.iLike]: `%${q.trim()}%` } },
            ],
          },
        ],
      },
      attributes: ['id', 'username', 'rank'],
      limit: 12,
    });

    return res.status(200).json({ users });
  } catch (err) {
    return next(err);
  }
});
// Refill demo balance — gives broke users $1000 to keep playing
router.post('/refill', requireAuth, async (req, res, next) => {
  const { user } = req;
  const currUser = await User.findByPk(user.id);
  if (!currUser) return next(Object.assign(new Error('User not found'), { status: 404 }));

  currUser.balance += 1000;
  await currUser.save();

  return res.status(200).json({ balance: currUser.balance });
});

// Get info about curruser
router.get('/current',requireAuth, validateQueryParameters, async (req, res, next) => {

  const {user} = req
  const currUser = await User.findByPk(user.id);

  if (!currUser) {
    const err = new Error('currUser not found');
    err.statusCode = 404;
    err.status = 404;
    return next(err);
  }


  return res.status(200).json({ User: currUser });
});


// GET /api/users/me/stats?days=30
router.get('/me/stats', requireAuth, async (req, res, next) => {
  const { user } = req;
  const days = parseInt(req.query.days, 10) || 30;
  try {
    const stats = await historyController.getHistoryStats(user.id, days);
    return res.json(stats);
  } catch (e) {
    next(e);
  }
});

// GET /api/users/me/hands?limit=50
router.get('/me/hands', requireAuth, async (req, res, next) => {
  const { user } = req;
  const limit = parseInt(req.query.limit, 10) || 50;
  try {
    const hands = await historyController.getHandHistory(user.id, limit);
    return res.json({ hands });
  } catch (e) {
    next(e);
  }
});

// GET /api/users/me/friends/leaderboard
router.get('/me/friends/leaderboard', requireAuth, async (req, res, next) => {
  const { user } = req;
  try {
    const leaderboard = await historyController.getFriendsLeaderboard(user.id);
    return res.json({ leaderboard });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
