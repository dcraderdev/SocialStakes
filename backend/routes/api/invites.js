const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { inviteController } = require('../../controllers/inviteController');
const { friendController } = require('../../controllers/friendController');

// POST /api/invites — send an invite by email
router.post('/', requireAuth, async (req, res, next) => {
  const { user } = req;
  const { recipientEmail, customMessage } = req.body;

  if (!recipientEmail) {
    const err = new Error('recipientEmail is required');
    err.status = 400;
    return next(err);
  }

  try {
    const { invite, inviteUrl } = await inviteController.createInvite({
      senderId: user.id,
      senderUsername: user.username,
      recipientEmail,
      customMessage,
    });
    return res.status(201).json({ invite, inviteUrl });
  } catch (err) {
    next(err);
  }
});

// GET /api/invites/code/:code — look up invite info (for the redemption page)
router.get('/code/:code', async (req, res, next) => {
  const { code } = req.params;
  try {
    const invite = await inviteController.getInviteByCode(code);
    if (!invite) {
      const err = new Error('Invite not found');
      err.status = 404;
      return next(err);
    }
    return res.json({
      senderUsername: invite.sender?.username,
      status: invite.status,
      expiresAt: invite.expiresAt,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/invites/redeem/:code — redeem invite after signup (auto-friend both users)
router.post('/redeem/:code', requireAuth, async (req, res, next) => {
  const { user } = req;
  const { code } = req.params;

  try {
    const invite = await inviteController.redeemInvite(code, user.id);
    if (!invite) {
      return res.status(410).json({ message: 'Invite is invalid or expired' });
    }

    // Auto-create friendship between sender and new user
    const friendRequestObj = {
      userId: invite.senderId,
      recipientId: user.id,
      username: 'inviter',
      recipientUsername: user.username,
    };

    try {
      await friendController.sendFriendRequest(friendRequestObj);
      // Sender accepts their own request to complete the friendship
      const acceptObj = {
        userId: user.id,
        recipientId: invite.senderId,
        username: user.username,
        recipientUsername: 'inviter',
      };
      await friendController.acceptFriendRequest(acceptObj);
    } catch (friendErr) {
      // Friendship creation failed but invite was redeemed — not fatal
      console.error('[invites] Friendship auto-create failed:', friendErr.message);
    }

    return res.json({ message: 'Invite redeemed', senderId: invite.senderId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
