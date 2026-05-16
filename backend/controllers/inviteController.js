const crypto = require('crypto');
const { Invite, User } = require('../db/models');
const { sendEmail } = require('../utils/emailService');

const INVITE_TTL_DAYS = 7;

function generateCode() {
  return crypto.randomBytes(24).toString('hex');
}

function expiresAt() {
  const d = new Date();
  d.setDate(d.getDate() + INVITE_TTL_DAYS);
  return d;
}

function appBaseUrl() {
  return process.env.APP_BASE_URL || 'http://localhost:3000';
}

const inviteController = {
  async createInvite({ senderId, senderUsername, recipientEmail, customMessage }) {
    const existing = await User.findOne({ where: { email: recipientEmail } });

    const code = generateCode();
    const invite = await Invite.create({
      senderId,
      recipientEmail,
      recipientId: existing ? existing.id : null,
      code,
      status: 'pending',
      expiresAt: expiresAt(),
    });

    const inviteUrl = `${appBaseUrl()}/invite/${code}`;
    const subject = `${senderUsername} wants you to play on Social Stakes!`;
    const msgPart = customMessage ? `\n\nPersonal message: "${customMessage}"` : '';
    const body = `Hey! Your friend ${senderUsername} has invited you to join Social Stakes — a social poker & games platform.${msgPart}\n\nClick the link below to accept the invite and create your account:\n${inviteUrl}\n\nThis invite expires in ${INVITE_TTL_DAYS} days.`;

    await sendEmail({ to: recipientEmail, subject, body });

    return { invite, inviteUrl };
  },

  async getInviteByCode(code) {
    const invite = await Invite.findOne({
      where: { code },
      include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }],
    });
    return invite;
  },

  async redeemInvite(code, newUserId) {
    const invite = await Invite.findOne({ where: { code, status: 'pending' } });
    if (!invite) return null;

    if (new Date() > invite.expiresAt) {
      invite.status = 'expired';
      await invite.save();
      return null;
    }

    invite.status = 'accepted';
    invite.recipientId = newUserId;
    await invite.save();
    return invite;
  },
};

module.exports = { inviteController };
