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
  Action,
  Friendship,
  Pot,
  UserPot,
} = require('../db/models');

const {generateDeck} = require('./cardController')

const gameController = {
  async getGames() {
    const games = await Game.findAll({ where: { active: true } });

    if (!games) {
      const err = new Error('games not found');
      err.statusCode = 404;
      err.status = 404;
      throw err;
    }
    return games;
  },

  async getTablesByType(gameType) {
    const tables = await Table.findAll({
      where: {
        active: true,
      },
      include: [
        {
          model: Game,
          where: { gameType },
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'rake']
          },
        },
        {
          model: User,
          as: 'players',
          through: UserTable,
          attributes: ['id', 'username', 'rank'],
        },
      ],
      attributes: ['id','private'],
    });

    if (!tables) {
      return false;
    }
    return tables;
  },

  async getTableById(tableId) {
    const table = await Table.findByPk(tableId, {
      include: [
        {
          model: Game,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'rake']
          },

        },
        {
          model: UserTable,
          as: 'tableUsers',
          attributes: ['userId', 'currentBet', 'pendingBet', 'seat', 'disconnectTimer', 'tableBalance'],
        },
        {
          model: User,
          as: 'players',
          through: UserTable,
          attributes: ['id', 'username', 'rank'],
        },
        {
          model: GameSession,
          as: 'gameSessions',
          attributes: ['id','nonce','blockHash'],
        },
      ],
      attributes: ['id','private'],
    });

    if (!table) {
      return false;
    }

  
    const returnedTable = table.toJSON();
    
    // Add usernames to tableUsers
    for (let userTable of returnedTable.tableUsers) {
      for (let player of returnedTable.players) {
        if (player.id === userTable.userId) {
          userTable.username = player.username;
          break;
        }
      }
    }

    // Normalize the tableUsers array into an object
    const normalizedTableUsers = returnedTable.tableUsers.reduce((acc, user) => {
      acc[user.seat] = user;
      return acc;
    }, {})


    returnedTable.tableUsers = normalizedTableUsers

    
    return returnedTable;
  },



  async getUserTables(userId) {
    const userTables = await UserTable.findAll({where:{userId}})
    if(!userTables){
      return false
    }
    // const tableIds = userTables.map(userTable=>userTable.tableId)
    return userTables
  },


  async removeUserFromTables(userId) {
    const userTables = await UserTable.findAll({where:{userId}})
    const userToUpdate = await User.findByPk(userId);

    if(!userTables || !userToUpdate){
      return false
    }

    let totalTableBalance = 0;

    for(let userTable of userTables){
      totalTableBalance += userTable.tableBalance; 
      await userTable.destroy();
    }
  
    userToUpdate.balance += totalTableBalance;
    await userToUpdate.save();


    return
  },

  

  async takeSeat(tableId, seat, user, amount) {
    const userToUpdate = await User.findByPk(user.id);
    const table = await Table.findByPk(tableId, {
      include: [
        {
          model: Game,
        },
        {
          model: UserTable,
          as: 'tableUsers',
        },
        {
          model: User,
          as: 'players',
          through: UserTable,
          attributes: ['id', 'username', 'balance', 'rank'],
        },
      ],
    });
    if (!table) {
      return false;
    }


    const seatOccupied = table.tableUsers.some((player) => {
      console.log(player);
      if (player.seat === seat) {
        if (player.userId === user.id) {
          return true;
        } else {
          return true;
        }
      }
      return false;
    });

    if (seatOccupied) {
      console.log('false');
      return false;
    }

    //update users unplayed balance
    userToUpdate.balance -= amount;
    await userToUpdate.save();



    if (table.players.length < table.Game.maxNumPlayers) {
      const takeSeat = await UserTable.create({
        userId: user.id,
        tableId,
        seat,
        tableBalance: amount,
        currentBet: 0,
        pendingBet: 0,
        disconnectTimer: 0
      });
      if (!takeSeat) {
        return false;
      }


      return takeSeat;
    }
  },




  async leaveSeat(tableId, seat, user, tableBalance) {
    const userTable = await UserTable.findOne({ where: { tableId, userId:user.id } });
    const userToUpdate = await User.findByPk(user.id);

    if (!userTable) {
      return false;
    }

    userToUpdate.balance += tableBalance;
    await userToUpdate.save();
  
    await userTable.destroy();
    return true;
  },

  async changeSeat(tableId, userId, newSeat) {
    const userTable = await UserTable.findOne({ where: { tableId, userId } });

    if (!userTable) {
      return false;
    }

    userTable.seat = newSeat;
    await userTable.save();

    return true;
  },

  async addMessage(tableId, userId, content) {
    const table = await Table.findByPk(tableId)
    if (!table) {
      return false;
    }
    const newMessage = await Message.create({tableId, userId, content})
    if(!newMessage){
      return false
    }

    return true;
  },


  async addFunds(seatObj) {
    const {tableId, seat, userId, amount} = seatObj
    const userToUpdate = await User.findByPk(userId);
    const userTable = await UserTable.findOne({where:{
      userId,
      tableId
    }})

    if(!userTable || !userToUpdate){
      return false
    }

    if(userToUpdate.balance<amount){
      return false
    }


    try {
      //update users unplayed balance
      userToUpdate.balance -= amount;
      await userToUpdate.save();
      //update userTable balance
      userTable.tableBalance += amount;
      await userTable.save();
      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  
  },


  async dealCards(dealObj) {
    const {tableId,gameSessionId, blockHash, nonce, decksUsed} = dealObj


    const newRound = await Round.create({tableId})
    if(!newRound){
      return false
    }


    const getServerSeed = await ServerSeed.findOne({
      where:{
        gameSessionId,
        used: false
      },
      attributes:['serverSeed']
    })

    let serverSeed = getServerSeed.serverSeed
    let deck = await generateDeck(serverSeed, blockHash, nonce, decksUsed);
    let deckandRoundId = {roundId: newRound.id, deck}
    return deckandRoundId
  },




  async createHands(userTableIds, roundId) {
    let handIds = [];
  
    const hands = await Promise.all(userTableIds.map(async (id) => {
      const newHand = await Hand.create({userTableId: id, roundId});
      return newHand;
    }));
  
    hands.forEach(hand => {
      if(hand) {
        handIds.push(hand.id);
      }
    });
  
    return handIds;
  }

};

module.exports = {
  gameController,
};
