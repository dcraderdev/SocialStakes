'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GameSessions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      tableId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Tables',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      serverSeed: {
        type: Sequelize.STRING
      },
      clientSeed: {
        type: Sequelize.STRING
      },
      blockHash: {
        type: Sequelize.STRING
      },
      nonce: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GameSessions', options);
  }
};
