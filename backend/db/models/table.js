'use strict';
const {Model} = require('sequelize');
const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Table extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Table.belongsToMany(models.User, { through: 'UserTables', foreignKey: 'tableId', as: 'players' });
      Table.belongsTo(models.Game, {foreignKey:'gameId'})
      Table.belongsTo(models.User, {foreignKey:'userId'})
      // Table.hasMany(models.Message, {foreignKey:'tableId'})
      Table.hasMany(models.UserTable, {foreignKey:'tableId', as: 'tableUsers'})
      Table.hasMany(models.GameSession, {foreignKey:'tableId', as: 'gameSessions'})
    }
  }

  Table.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4(), 
    },
    active: DataTypes.BOOLEAN,
    gameId: DataTypes.STRING,
    userId: DataTypes.UUID,
    shufflePoint: DataTypes.INTEGER,
    passCode: DataTypes.STRING,
    private: DataTypes.BOOLEAN,
    tableName: DataTypes.STRING,
    tableBalance: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Table',
  });

  return Table;
};
