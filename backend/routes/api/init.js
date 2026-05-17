// backend/routes/api/init.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { User } = require('../../db/models');
const { setTokenCookie } = require('../../utils/auth');
const router = express.Router();

// GET /api/init — restore existing session or auto-create a guest demo user.
// restoreUser middleware in parent router already set req.user if a valid token exists.
router.get('/', async (req, res, next) => {
  if (req.user) {
    const u = req.user;
    return res.json({
      id: u.id,
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      balance: u.balance,
    });
  }

  // No valid session — create an anonymous guest
  try {
    const chars = Math.random().toString(36).slice(2, 7).toUpperCase();
    const username = `Guest_${chars}`;
    const ts = Date.now();
    const email = `guest_${ts}_${chars}@demo.internal`;
    const hashedPassword = bcrypt.hashSync(uuidv4());

    const newUser = await User.create({
      username,
      email,
      hashedPassword,
      firstName: 'Guest',
      lastName: 'User',
      balance: 1000,
    });

    const fullUser = await User.scope('currentUser').findByPk(newUser.id);
    setTokenCookie(res, fullUser);

    return res.json({
      id: fullUser.id,
      username: fullUser.username,
      email: fullUser.email,
      firstName: fullUser.firstName,
      lastName: fullUser.lastName,
      balance: fullUser.balance,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
