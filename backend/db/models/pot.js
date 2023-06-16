'use strict';
const { Model } = require('sequelize');
const uuid = require('uuid');
module.exports = (sequelize, DataTypes) => {
  class Pot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     static associate(models) {
      Pot.belongsTo(models.Round, { foreignKey: 'roundId' });
      Pot.hasMany(models.UserPot, { foreignKey: 'potId' });
    }
  }
  Pot.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4(),
    },
    roundId: DataTypes.INTEGER,
    potAmount: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Pot',
  });
  return Pot;
};