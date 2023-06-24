// backend/routes/api/games.js
const express = require('express');
const router = express.Router();
const {gameController} = require('../../controllers/gameController')


// Get all games
router.get('/all', async (req, res, next) => {
  const games = await gameController.getGames()

  if (!games) {
    const err = new Error('games not found');
    err.statusCode = 404;
    err.status = 404;
    return next(err);
  }

  return res.status(200).json({ games });
});



module.exports = router;
