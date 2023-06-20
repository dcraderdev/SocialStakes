// backend/routes/api/tables.js
const express = require('express');
const router = express.Router();
const {gameController} = require('../../controllers/gameController')
const { Table, User, Game } = require('../../db/models');



// Get table by type/gameId
router.get('/game/:gameId', async (req, res, next) => {

  const {gameId} = req.params
  const tables = await gameController.getTablesByType(gameId)

  if (!tables) {
    const err = new Error('tables not found');
    err.statusCode = 404;
    err.status = 404;
    return next(err);
  }

  return res.status(200).json({ tables });
});

;

module.exports = router;
