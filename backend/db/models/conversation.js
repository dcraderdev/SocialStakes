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

      // Conversation.belongsToMany(models.User, { 
      //   through: models.UserConversation, 
      //   foreignKey: 'conversationId', 
      //   as: 'users' });

        Conversation.belongsToMany(models.User, {
          through: 'UserConversations',
          foreignKey: 'conversationId',
          otherKey: 'userId',
          as: 'users'
        });



      Conversation.belongsTo(models.Table, {
        foreignKey: 'tableId',
        as: 'table',
      });

      Conversation.hasOne(models.Friendship, {foreignKey: 'conversationId'})


    }
  }


  Conversation.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4(), 
    },
    tableId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    chatName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hasDefaultChatName: {
      type: DataTypes.BOOLEAN,
    },
    isDirectMessage: {
      type: DataTypes.BOOLEAN,
    },

  }, {
    sequelize,
    modelName: 'Conversation',
  });
  return Conversation;
};
