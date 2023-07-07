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
        // {
        //   model: UserTable,
        //   where:{active:true},
        //   required: false, 
        //   as: 'tableUsers',
        //   attributes: ['userId', 'currentBet', 'pendingBet', 'seat', 'disconnectTimer', 'tableBalance'],
        // },
        // {
        //   model: User,
        //   as: 'players',
        //   through: UserTable,
        //   attributes: ['id', 'username', 'rank'],
        // },
        {
          model: GameSession,
          as: 'gameSessions',
          attributes: ['id','nonce','blockHash'],
        },
      ],
      attributes: ['id','private', 'shufflePoint'],
    });

    if (!table) {
      return false;
    }

  
    // const returnedTable = table.toJSON();
    
    // // Add usernames to tableUsers
    // for (let userTable of returnedTable.tableUsers) {
    //   for (let player of returnedTable.players) {
    //     if (player.id === userTable.userId) {
    //       userTable.username = player.username;
    //       break;
    //     }
    //   }
    // }

    // // Normalize the tableUsers array into an object
    // const normalizedTableUsers = returnedTable.tableUsers.reduce((acc, user) => {
    //   acc[user.seat] = user;
    //   return acc;
    // }, {})


    // returnedTable.tableUsers = normalizedTableUsers

    
    // return returnedTable;
    return table;
  },



  async getUserTables(userId) {
    const userTables = await UserTable.findAll({where:{userId,active:true}})
    if(!userTables){
      return false
    }
    // const tableIds = userTables.map(userTable=>userTable.tableId)
    return userTables
  },


  async removeUserFromTables(userId) {
    const userTables = await UserTable.findAll({where:{userId,active:true}})
    const userToUpdate = await User.findByPk(userId);

    if(!userTables || !userToUpdate){
      return false
    }

    let sumOfTableBalances = 0;

    for(let userTable of userTables){
console.log('ADDING BALANCE: ', userTable.tableBalance);

      sumOfTableBalances += userTable.tableBalance; 
      userTable.active = false;
      await userTable.save();
    }
  
console.log('CURRENT BALANCE: ', userToUpdate.balance);

    userToUpdate.balance += sumOfTableBalances;

    console.log('NEW BALANCE: ', userToUpdate.balance);

    await userToUpdate.save();


    return
  },

  async takeSeat(tableId, seat, user, amount) {
    const userToUpdate = await User.findByPk(user.id);
    
    // Query the UserTable directly with the specific table and seat
    const activeUserInSeat = await UserTable.findOne({
      where: { 
        tableId,
        seat,
        active: true
      },
    });
  
    // If there's an active user in the seat, return false
    if (activeUserInSeat) {
      console.log('Seat is active');
      return false;
    }
  
    // update user's unplayed balance
    userToUpdate.balance -= amount;
    await userToUpdate.save();
  
    const table = await Table.findByPk(tableId, {
      include: [
        {
          model: Game,
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
  
    if (table.players.length < table.Game.maxNumPlayers) {
      const takeSeat = await UserTable.create({
        userId: user.id,
        tableId,
        seat,
        tableBalance: amount,
        currentBet: 0,
        pendingBet: 0,
        disconnectTimer: 0,
        active: true,
      });
  
      if (!takeSeat) {
        return false;
      }
  
      return takeSeat;
    }
  },
  


  async leaveSeat(leaveSeatObj) {
    const { userId, userTableId, tableBalance } = leaveSeatObj
    const userTable = await UserTable.findByPk(userTableId);
    const userToUpdate = await User.findByPk(userId);

    if (!userTable || !userToUpdate) {
      return false;
    }

    userToUpdate.balance += tableBalance;
    
    userTable.active = false;
    await userTable.save();
    await userToUpdate.save();
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
    const {tableId, seat, userId, amount, userTableId} = seatObj
    const userToUpdate = await User.findByPk(userId);
    const userTable = await UserTable.findByPk(userTableId)

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

    console.log('-=-=-=-=DEALING CARDS-=-=-=-=-=');
    console.log('-=-=-=-=DEALING CARDS-=-=-=-=-=');
    console.log('-=-=-=-=DEALING CARDS-=-=-=-=-=');
    console.log('-=-=-=-=DEALING CARDS-=-=-=-=-=');
    console.log('-=-=-=-=DEALING CARDS-=-=-=-=-=');
    console.log('-=-=-=-=DEALING CARDS-=-=-=-=-=');

    console.log(dealObj);
    console.log('-=-=-=-=DEALING CARDS-=-=-=-=-=');
    console.log('-=-=-=-=DEALING CARDS-=-=-=-=-=');
    console.log('-=-=-=-=DEALING CARDS-=-=-=-=-=');
    console.log('-=-=-=-=DEALING CARDS-=-=-=-=-=');
    console.log('-=-=-=-=DEALING CARDS-=-=-=-=-=');
    console.log('-=-=-=-=DEALING CARDS-=-=-=-=-=');
    console.log('-=-=-=-=DEALING CARDS-=-=-=-=-=');


    const newRound = await Round.create({tableId, active:true})
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


  async newRound(dealObj) {
    const {tableId} = dealObj


    const newRound = await Round.create({tableId, active:true})
    if(!newRound){
      return false
    }

    let roundId = newRound.id


    return roundId
  },




// Create mulitple hands at start of blackjack round
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
  },

// Create mulitple hands at start of blackjack round
async createHand(userTableId, roundId) {
  const newHand = await Hand.create({userTableId, roundId});
  if(!newHand) return false
  return newHand;
},



  

// Save hand at end of blackjack round
  async savePlayerHand(handObj) {
    const{handId, userTableId, cards, result, totalProfitLoss, hasInsuranceBet} = handObj

    const handToUpdate = await Hand.findByPk(handId);
    const userTableToUpdate = await UserTable.findByPk(userTableId);
    if(!handToUpdate || !userTableToUpdate){
      return false
    }

    handToUpdate.result = result
    handToUpdate.cards = cards
    handToUpdate.profitLoss = totalProfitLoss
    handToUpdate.hasInsuranceBet = hasInsuranceBet
    await handToUpdate.save();

    userTableToUpdate.tableBalance += totalProfitLoss
    await userTableToUpdate.save();

    return 
  },

// Save hand at end of blackjack round
async saveDealerHand(handObj) {
  const{id, cards, active, nonce} = handObj 
  const roundToUpdate = await Round.findByPk(id);
  if(!roundToUpdate){
    return false
  }

  roundToUpdate.cards = cards
  roundToUpdate.active = active
  roundToUpdate.nonce = nonce
  await roundToUpdate.save();

  return 
},





};

module.exports = {
  gameController,
};
