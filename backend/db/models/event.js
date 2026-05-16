'use strict';
const { Model } = require('sequelize');
const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      Event.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  Event.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4(),
    },
    userId: DataTypes.UUID,
    type: {
      type: DataTypes.ENUM,
      values: [
        'hand_won',
        'hand_blackjack',
        'friend_added',
        'table_joined',
        'streak_hit',
        'bankroll_high',
      ],
    },
    payload: DataTypes.JSON,
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
