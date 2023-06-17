'use strict';
const { Model } = require('sequelize');
const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class GameSession extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      GameSession.belongsTo(models.Table, { foreignKey: 'tableId' });
      GameSession.hasMany(models.ServerSeed, { foreignKey: 'serverSeedId' });
    }
  }

  GameSession.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4(), 
    },
    tableId: DataTypes.UUID,
    serverSeedId: DataTypes.UUID,
    blockHash: DataTypes.STRING,
    clientSeed: DataTypes.STRING,
    nonce: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'GameSession'
  });

  return GameSession;
};
