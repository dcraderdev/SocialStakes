// backend/routes/api/tables.js
const express = require('express');
const router = express.Router();
const {gameController} = require('../../controllers/gameController')
const { Table, User, Game } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');



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

// Get table by tableId
router.get('/:tableId', requireAuth, async (req, res, next) => {

  const {tableId} = req.params

  console.log(tableId);

  const table = await gameController.getTableById(tableId)

  if (!table) {
    const err = new Error('table not found');
    err.statusCode = 404;
    err.status = 404;
    return next(err);
  }

  return res.status(200).json({ table });
});

// Join table by tableId
router.post('/:tableId/join', requireAuth, async (req, res, next) => {

  const {tableId} = req.params
  const {seat} = req.body
  const {user} = req


  const table = await gameController.takeSeat(tableId, seat, user)

  if (!table) {
    const err = new Error('seat taken');
    err.statusCode = 403;
    err.status = 403;
    return next(err);
  }

  return res.status(200).json({ table });
});



// Change seat by tableId
router.put('/:tableId/seat', requireAuth, async (req, res, next) => {

  const {tableId} = req.params
  const {seat} = req.body
  const {user} = req

  const table = await gameController.changeSeat(tableId, user, seat)

  if (!table) {
    const err = new Error('table not found');
    err.statusCode = 403;
    err.status = 403;
    return next(err);
  }

  return res.status(200).json({ table });
});


// Leave table by tableId
router.delete('/:tableId/leave', requireAuth, async (req, res, next) => {

  const {tableId} = req.params
  const {seat} = req.body
  const {user} = req


  // console.log('-=-=-==-');
  // console.log(tableId);
  // console.log(seat);
  // console.log(user);
  // console.log('-=-=-==-');

  const table = await gameController.leaveSeat(tableId, user.id)

  if (!table) {
    const err = new Error('table not found');
    err.statusCode = 404;
    err.status = 404;
    return next(err);
  }

  return res.status(200).json(true);
});




module.exports = router;
