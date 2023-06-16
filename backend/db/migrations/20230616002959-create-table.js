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
        type: Sequelize.STRING
      },
      gameId: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'Games',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      cutPoint: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      shufflePoint: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      passCode: {
        type: Sequelize.STRING,
      },
      private: {
        type: Sequelize.BOOLEAN,
      },
      endedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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