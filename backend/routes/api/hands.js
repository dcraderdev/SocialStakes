// backend/routes/api/hands.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { historyController } = require('../../controllers/historyController');

// GET /api/hands/:id/verify
router.get('/:id/verify', requireAuth, async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;
  try {
    const result = await historyController.verifyHand(id, user.id);
    if (!result) {
      const err = new Error('Hand not found or not yours');
      err.status = 404;
      return next(err);
    }
    return res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
