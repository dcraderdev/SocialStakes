'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Round extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Round.belongsTo(models.Table, {foreignKey:'tableId'})
      Round.hasMany(models.Hand, { foreignKey: 'roundId' });
      // Round.belongsTo(models.Action, { foreignKey: 'roundId' });



    }
  }
  Round.init({
    tableId: DataTypes.UUID,
    active: DataTypes.BOOLEAN,
    cards: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Round',
  });
  return Round;
};