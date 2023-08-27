const {
  User,
  Game,
  Table,
  UserTable,
  ServerSeed,
  Message,
  Round,
  Hand,
  GameSession,
  Conversation,
  UserConversation,
  Action,
  Friendship,
  Pot,
  UserPot,
} = require('../db/models');


const statController = {
 


async getUserStats(userId) {

  console.log('-=-=-=-=-=-=-=-=-=-=-=-');
  console.log('-=-=-=-=-=-=-=-=-=-=-=-');
  console.log('-=-=-=-=-=-=-=-=-=-=-=-');
  console.log('-=-=-=-=-=-=-=-=-=-=-=-');
  console.log('-=-=-=-=-=-=-=-=-=-=-=-');


  
  const userStats = await User.findByPk(userId, {
    include: [
      {
        model: UserTable,
        as: 'tables',
        include: [
          {
            model: Hand,
            attributes: ['id', 'cards', 'result', 'profitLoss', 'insuranceBet', ],
            include: [
              {
                model: Round,
                attributes: ['id', 'cards' ]
              },
            ],
          },
        ],
        attributes: ['id', 'tableId', 'userId', 'active'],
      },
    ],
    attributes: ['id', 'username', 'balance', 'rank'],
  });

  if(!userStats){
    return false
  } 



  return userStats
},

async getUserTables(userId) {

  console.log('**^***^**^**^**^**^**^**^**^**^*^*^*');
  console.log('**^***^**^**^**^**^**^**^**^**^*^*^*');
  console.log('**^***^**^**^**^**^**^**^**^**^*^*^*');
  console.log('**^***^**^**^**^**^**^**^**^**^*^*^*');
  console.log('**^***^**^**^**^**^**^**^**^**^*^*^*');


  
  const userStats = await User.findByPk(userId, {
    include: [
      {
        model: UserTable,
        as: 'tables',
        include: [
          {
            model: Hand,
            attributes: ['id', 'cards', 'result', 'profitLoss', 'insuranceBet', ],
            include: [
              {
                model: Round,
                attributes: ['id', 'cards' ]
              },
            ],
          },
        ],
        attributes: ['id', 'tableId', 'userId', 'active'],
      },
    ],
    attributes: ['id', 'username', 'balance', 'rank'],
  });

  if(!userStats){
    return false
  } 



  return userStats
},









};

module.exports = {
  statController,
};
