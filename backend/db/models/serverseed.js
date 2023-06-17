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
      ServerSeed.hasOne(models.GameSession, { foreignKey: 'serverSeedId' });

    }
  }
  ServerSeed.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4(), 
    },
    serverSeed:{
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'ServerSeed',
  });
  return ServerSeed;
};