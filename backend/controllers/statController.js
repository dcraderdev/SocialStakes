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

const {
  generateDeck,
  shuffle,
  fetchLatestBlock,
  generateSeed,
} = require('./cardController');



function formatDuration(minutes) {
  const days = Math.floor(minutes / (24 * 60));
  minutes -= days * 24 * 60;

  const hours = Math.floor(minutes / 60);
  minutes = Math.round(minutes - hours * 60);

  const formatted = [];
  if (days) formatted.push(`${days} days`);
  if (hours) formatted.push(`${hours} hours`);
  if (minutes) formatted.push(`${minutes} minutes`);
  
  // If the total duration is less than 1 minute, then return "1 minute"
  return formatted.length ? formatted.join(' ') : "<1 minute";
}

function convertToReadableFormatShort(timestamp) {
  const date = new Date(timestamp);

  const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
  const readableFormat = date.toLocaleString('en-US', options);

  return readableFormat;
}




const calculateSessionStats = (userTableStats) => {







  return userTableStats.reduce((acc, table) => {



    console.log('-=-=-=-=-=tabletabletabletabletabletable-=--=-=-=');
    console.log('-=-=-=-=-=-=--=-=-=');
    console.log('-=-=-=-=-=-=--=-=-=');
    console.log('-=-=-=-=-=-=--=-=-=');
    console.log(table.Table.Game);
    console.log(table.Table.Game);
    console.log(table.Table.Game);
    console.log(table.Table.Game);
    console.log(table.Table.Game);

    console.log('-=-=-=-=-=-=--=-=-=');
    console.log('-=-=-=-=-=-=--=-=-=');
    console.log('-=-=-=-=-=-=--=-=-=');
    console.log('-=-=-=-=-=-=--=-=-=');


    // Count hands and profit/loss for each table
    const handsPlayed = table.Hands.length;
    const profitLoss = table.Hands.reduce((handAcc, hand) => handAcc + hand.profitLoss, 0);
    const tableName = table.Table.tableName;
    
    // Convert table's createdAt to readable format
    const tableStartTime = convertToReadableFormatShort(new Date(table.createdAt));
    
    let lastHandEndTime = null;
    let playTimeInMinutes = null;
    
    if (handsPlayed > 0) {
      // Set endTime based on the latest hand's updatedAt
      lastHandEndTime = table.Hands.reduce((lastTime, hand) => {
        const handTime = new Date(hand.updatedAt);
        return (!lastTime || handTime > lastTime) ? handTime : lastTime;
      }, null);
      
      playTimeInMinutes = (lastHandEndTime - new Date(table.createdAt)) / (1000 * 60);
    }


    // Use table.Table.id as the key
    acc[table.id] = {
      tableName,
      tableId: table.tableId,
      minBet: table.Table.Game.minBet,
      maxBet: table.Table.Game.maxBet,
      variant: table.Table.Game.variant,
      smallBlind: table.Table.Game.smallBlind,
      bigBlind: table.Table.Game.bigBlind,
      totalHandsPlayed: handsPlayed,
      totalProfitLoss: profitLoss,
      startTime: tableStartTime,
      timeAtTable: formatDuration(playTimeInMinutes)
    };
    
    return acc;
  }, {});
};

















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
              attributes: [
                'id',
                'cards',
                'result',
                'profitLoss',
                'insuranceBet',
              ],
              include: [
                {
                  model: Round,
                  attributes: ['id', 'cards'],
                },
              ],
            },
          ],
          attributes: ['id', 'tableId', 'userId', 'active'],
        },
      ],
      attributes: ['id', 'username', 'balance', 'rank'],
    });

    if (!userStats) {
      return false;
    }

    return userStats;
  },

  async getUserTables(userId) {
    console.log('**^***^**^**^**^**^**^**^**^**^*^*^*');
    console.log('**^***^**^**^**^**^**^**^**^**^*^*^*');

    const userTableStats = await UserTable.findAll({
      where: { userId: userId },
      attributes: ['id', 'tableId', 'userId', 'active', 'createdAt'],
      include: [
        {
          model: Table,
          attributes: ['gameId', 'tableName'],
          include: [
            {
              model: Game,
              attributes: [
                'gameType',
                'variant',
                'decksUsed',
                'smallBlind',
                'bigBlind',
                'minBet',
                'maxBet',
              ],
            },
          ],
        },
        {
          model: Hand,
          attributes: [
            'id',
            'cards',
            'result',
            'profitLoss',
            'insuranceBet',
            'initialBet',
            'updatedAt'
          ],
          include: [
            {
              model: Round,
              attributes: ['id', 'cards'],
            },
          ],
        },
      ],
    });

    if (!userTableStats || userTableStats.length === 0) {
      return false;
    }






    const sessionStats = calculateSessionStats(userTableStats);

    console.log('-=-=-=-=-=sessionStats-=--=-=-=');
    console.log('-=-=-=-=-=-=--=-=-=');
    console.log('-=-=-=-=-=-=--=-=-=');
    console.log('-=-=-=-=-=-=--=-=-=');
    console.log(sessionStats);
    console.log('-=-=-=-=-=-=--=-=-=');
    console.log('-=-=-=-=-=-=--=-=-=');
    console.log('-=-=-=-=-=-=--=-=-=');
    console.log('-=-=-=-=-=-=--=-=-=');





    return {
      sessionStats
    }



  },



};

module.exports = {
  statController,
};
