'use strict';
const { Model } = require('sequelize');
const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class UserTable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserTable.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      UserTable.belongsTo(models.Table, { foreignKey: 'tableId'});
    }
  }
  UserTable.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4(), 
    },
    userId: DataTypes.UUID,
    tableId: DataTypes.UUID,
    seat: DataTypes.INTEGER,
    tableBalance: DataTypes.INTEGER,
    currentBet: DataTypes.INTEGER,
    pendingBet: DataTypes.INTEGER,
    disconnectTimer: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'UserTable',
  });
  return UserTable;
};