const {
  User,
  Game,
  Table,
  UserTable,
  Round,
  Hand,
  GameSession,
  Action,
  Friendship,
  Pot,
  UserPot,
  Message,
} = require('../db/models');

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
        },
        {
          model: User,
          as: 'players',
          through: UserTable,
          attributes: ['id', 'username', 'balance', 'rank'],
        },
      ],
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







  async takeSeat(tableId, seat, user, amount) {
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
          return true; // If we're sitting in the checked seat, return the userTable info
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



    if (table.players.length < table.Game.maxNumPlayers) {
      const takeSeat = await UserTable.create({
        userId: user.id,
        tableId,
        seat,
        tableBalance: amount
      });
      if (!takeSeat) {
        return false;
      }


      return takeSeat;
    }
  },

  async leaveSeat(tableId, userId) {
    const userTable = await UserTable.findOne({ where: { tableId, userId } });

    if (!userTable) {
      return false;
    }

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
};

module.exports = {
  gameController,
};
