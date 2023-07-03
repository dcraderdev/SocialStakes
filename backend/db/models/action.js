'use strict';
const {Model} = require('sequelize');
const uuid = require('uuid');


module.exports = (sequelize, DataTypes) => {
  class Action extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Action.belongsTo(models.User, { foreignKey: 'userId' });
      // Action.belongsTo(models.Round, { foreignKey: 'roundId' });
    
    }
  }
  Action.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4(), 
    },
    userId: DataTypes.UUID,
    roundId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    card: DataTypes.STRING,
    betSize: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Action',
  });
  return Action;
};