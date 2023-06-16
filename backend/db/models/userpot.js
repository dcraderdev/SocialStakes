'use strict';
const { Model } = require('sequelize');
const uuid = require('uuid');
module.exports = (sequelize, DataTypes) => {
  class UserPot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     static associate(models) {
      UserPot.belongsTo(models.User, { foreignKey: 'userId' });
      UserPot.belongsTo(models.Pot, { foreignKey: 'potId' });
    }
  }
  UserPot.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4(),
    },
    won: DataTypes.BOOLEAN,
    userId: DataTypes.UUID,
    potId: DataTypes.UUID,
  }, {
    sequelize,
    modelName: 'UserPot',
  });
  return UserPot;
};