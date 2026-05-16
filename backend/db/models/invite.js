'use strict';
const { Model } = require('sequelize');
const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Invite extends Model {
    static associate(models) {
      Invite.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
      Invite.belongsTo(models.User, { foreignKey: 'recipientId', as: 'recipient' });
    }
  }

  Invite.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4(),
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    recipientEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    recipientId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'expired'),
      defaultValue: 'pending',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Invite',
  });

  return Invite;
};
