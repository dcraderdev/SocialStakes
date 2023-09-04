'use strict';
const { Model } = require('sequelize');
const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Game extends Model {

    static associate(models) {
      Game.hasMany(models.Table, {foreignKey:'gameId'})
    }

  }
  Game.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    gameType: DataTypes.STRING,
    variant: DataTypes.STRING,
    shortName: DataTypes.STRING,
    decksUsed: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN,
    minNumPlayers: DataTypes.INTEGER,
    maxNumPlayers: DataTypes.INTEGER,
    smallBlind: DataTypes.INTEGER,
    bigBlind: DataTypes.INTEGER,
    minBet: DataTypes.INTEGER,
    maxBet: DataTypes.INTEGER,
    rake: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Game',
  });
  return Game;
};

