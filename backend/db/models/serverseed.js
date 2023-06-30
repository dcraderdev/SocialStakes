'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ServerSeed extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ServerSeed.belongsTo(models.GameSession, { foreignKey: 'gameSessionId' });
    }
  }
  ServerSeed.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4(), 
    },
    serverSeed:DataTypes.STRING,
    gameSessionId: DataTypes.UUID,
    used: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'ServerSeed',
  });
  return ServerSeed;
};