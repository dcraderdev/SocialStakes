'use strict';
/** @type {import('sequelize-cli').Migration} */


let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tables', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      gameId: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'Games',
        },
        onDelete: 'CASCADE'
      },
      shufflePoint: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      passCode: {
        type: Sequelize.STRING,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      private: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      endedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null
      },
      tableBalance: {
        type: Sequelize.INTEGER,
      },
      tableName: {
        type: Sequelize.STRING,
        defaultValue: null

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
    },options);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tables',options);
  }
};