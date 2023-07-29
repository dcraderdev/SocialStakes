// models/conversation.js
'use strict';
const { Model } = require('sequelize');
const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {


    static associate(models) {
      // Associations
      Conversation.hasMany(models.Message, {
        foreignKey: 'conversationId',
        as: 'messages',
      });

      Conversation.belongsToMany(models.User, { 
        through: models.UserConversation, 
        foreignKey: 'conversationId', 
        as: 'users' });

      Conversation.belongsTo(models.Table, {
        foreignKey: 'tableId',
        as: 'table',
      });

    }
  }


  Conversation.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4(), 
    },
    tableId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    chatName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Conversation',
  });
  return Conversation;
};
