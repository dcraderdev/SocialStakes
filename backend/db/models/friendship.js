'use strict';
const { Model } = require('sequelize');
const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Friendship extends Model {
    
    static associate(models) {
      Friendship.belongsTo(models.User, {  foreignKey: 'user1Id', as: 'user1' });
      Friendship.belongsTo(models.User, {  foreignKey: 'user2Id', as: 'user2' });
      Friendship.belongsTo(models.User, { as: 'actionUser', foreignKey: 'actionUserId' });
      Friendship.belongsTo( models.Conversation, {foreignKey: 'conversationId'})
    
    }
  }

  Friendship.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4(),
    },
    user1Id: DataTypes.UUID,
    user2Id: DataTypes.UUID,
    actionUserId: DataTypes.UUID,
    status: {
      type: DataTypes.ENUM,
      values: ['pending', 'accepted', 'rejected'],
      defaultValue: 'pending',
    },
  }, 
  {
    sequelize,
    modelName: 'Friendship',
    indexes: [
      {
        unique: true,
        fields: ['user1Id', 'user2Id']
      }
    ]
  });

  return Friendship;
};

