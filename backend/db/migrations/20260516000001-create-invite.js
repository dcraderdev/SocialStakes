'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Invites', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      senderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users' },
        onDelete: 'CASCADE',
      },
      recipientEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      recipientId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Users' },
        onDelete: 'SET NULL',
      },
      code: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'expired'),
        defaultValue: 'pending',
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, options);
  },
  down: async (queryInterface) => {
    return queryInterface.dropTable('Invites', options);
  },
};
