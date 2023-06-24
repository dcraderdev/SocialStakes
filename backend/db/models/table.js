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
      Table.hasMany(models.Message, {foreignKey:'tableId'})
      Table.hasMany(models.UserTable, {foreignKey:'tableId', as: 'tableUsers'})
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
    cutPoint: DataTypes.INTEGER,
    shufflePoint: DataTypes.INTEGER,
    passCode: DataTypes.STRING,
    private: DataTypes.BOOLEAN,
    tableBalance: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Table',
  });

  return Table;
};
