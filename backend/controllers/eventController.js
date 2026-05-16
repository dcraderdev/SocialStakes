const { Event } = require('../db/models');

const eventController = {
  async createEvent(userId, type, payload) {
    try {
      return await Event.create({ userId, type, payload });
    } catch (err) {
      console.error('Event creation error:', err.message);
    }
  },
};

module.exports = { eventController };
