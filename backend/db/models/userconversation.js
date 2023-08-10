'use strict';
const {Model} = require('sequelize');
const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class UserConversation extends Model {


    

    
    static associate(models) {
      // UserConversation.belongsTo(models.User, {foreignKey:'userId'})
      // UserConversation.belongsTo(models.Conversation, {foreignKey:'conversationId', as: 'conversations'}) 
      UserConversation.belongsTo(models.User, {foreignKey:'userId', targetKey: 'id'})
      UserConversation.belongsTo(models.Conversation, {foreignKey:'conversationId', targetKey: 'id', as: 'conversations'}) 
      
    }
  }
  UserConversation.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4(), 
    },
    userId: DataTypes.UUID,
    conversationId: DataTypes.UUID,
    notification: DataTypes.BOOLEAN,
    hasLeft: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'UserConversation',
  });
  return UserConversation;
};
