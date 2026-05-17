const { PendingEmail } = require('../db/models');

async function sendEmail({ to, subject, body }) {
  console.log('\n[EMAIL SERVICE]');
  console.log(`  To:      ${to}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  Body:    ${body}`);
  console.log('[/EMAIL SERVICE]\n');

  try {
    await PendingEmail.create({ to, subject, body });
  } catch (err) {
    console.error('[emailService] Failed to save pending email:', err.message);
  }
}

module.exports = { sendEmail };
