'use strict';
const {Model} = require('sequelize');
const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Hand extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Hand.belongsTo(models.UserTable, { foreignKey: 'userTableId'});
      Hand.belongsTo(models.Round, { foreignKey: 'roundId'});

    }
  }
  Hand.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4(), 
    },
    userTableId: DataTypes.UUID,
    roundId: DataTypes.INTEGER,
    cards: DataTypes.STRING,
    result: DataTypes.STRING,
    profitLoss: DataTypes.INTEGER,
    insuranceBet: DataTypes.BOOLEAN,
    initialBet: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Hand',
  });
  return Hand;
};