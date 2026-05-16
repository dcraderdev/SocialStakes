'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      userId: {
        type: Sequelize.UUID,
        references: { model: 'Users' },
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM(
          'hand_won',
          'hand_blackjack',
          'friend_added',
          'table_joined',
          'streak_hit',
          'bankroll_high'
        ),
      },
      payload: {
        type: Sequelize.JSON,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, options);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Events', options);
  },
};
