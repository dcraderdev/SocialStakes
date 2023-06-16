'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("Friendships", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      user1Id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          as: 'user1Id',
          key: 'id'
        },
        onDelete: 'CASCADE',
      },
      user2Id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          as: 'user2Id',
          key: 'id'
        },
        onDelete: 'CASCADE',
      },
      actionUserId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          as: 'actionUser',
          key: 'id'
        },
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options);
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Friendships", options);
  }
};
