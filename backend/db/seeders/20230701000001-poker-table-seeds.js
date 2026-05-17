'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Tables';
    return queryInterface.bulkInsert(
      options,
      [
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234560001',
          gameId: 'pokerTexasHoldem',
          shufflePoint: 30,
          tableName: 'Vegas Strip - Hold\'em',
          tableBalance: 0,
          private: false,
          userId: 'e10d8de4-f4c7-4d28-9324-56aa9c000001',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234560002',
          gameId: 'pokerTexasHoldem',
          shufflePoint: 30,
          tableName: 'Sunset Room - Hold\'em',
          tableBalance: 0,
          private: false,
          userId: 'e10d8de4-f4c7-4d28-9324-56aa9c000001',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234560003',
          gameId: 'pokerTexasHoldem',
          shufflePoint: 30,
          tableName: 'High Roller - Hold\'em',
          tableBalance: 0,
          private: false,
          userId: 'e10d8de4-f4c7-4d28-9324-56aa9c000001',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Tables';
    return queryInterface.bulkDelete(options, {
      id: {
        [Sequelize.Op.in]: [
          'a1b2c3d4-e5f6-7890-abcd-ef1234560001',
          'a1b2c3d4-e5f6-7890-abcd-ef1234560002',
          'a1b2c3d4-e5f6-7890-abcd-ef1234560003',
        ],
      },
    });
  },
};
