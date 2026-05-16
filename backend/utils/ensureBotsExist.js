const bcrypt = require('bcryptjs');
const { User } = require('../db/models');

// Bellagio bots — seeded at the bot showcase table
const BELLAGIO_BOTS = [
  { id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a83', username: 'Jeff Ma' },
  { id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a84', username: 'John Chang' },
  { id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a85', username: 'Bill Kaplan' },
  { id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a86', username: 'Mike Aponte' },
  { id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a87', username: 'Jane Willis' },
  { id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a88', username: 'Seymon Dukach' },
];

// Roaming bots — used as opponents at non-Bellagio tables
const ROAMING_BOTS = [
  { id: 'e10d8de4-f4c8-4d28-9324-56aa9c924b01', username: 'Diana D.' },
  { id: 'e10d8de4-f4c8-4d28-9324-56aa9c924b02', username: 'Tommy H.' },
];

const ALL_BOTS = [...BELLAGIO_BOTS, ...ROAMING_BOTS];

async function ensureBotsExist() {
  try {
    const hashedPassword = bcrypt.hashSync('botpassword123', 10);

    for (const bot of ALL_BOTS) {
      await User.findOrCreate({
        where: { id: bot.id },
        defaults: {
          id: bot.id,
          firstName: bot.username.split(' ')[0],
          lastName: bot.username.split(' ')[1] || 'Bot',
          username: bot.username,
          email: `${bot.id}@bot.internal`,
          hashedPassword,
          balance: 1000000,
        },
      });
    }
  } catch (err) {
    console.error('[boot] ensureBotsExist error:', err.message);
  }
}

module.exports = { ensureBotsExist, BELLAGIO_BOTS, ROAMING_BOTS, ALL_BOTS };
