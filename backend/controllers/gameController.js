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
    return table;
  },

  async takeSeat(tableId, seat, user) {
    console.log(tableId);
    console.log(seat);
    console.log(user.id);
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

    const alreadySitting = table.tableUsers.some((player) => {
      if (player.userId === user.id) {
        return true;
      }
      return false;
    });

    if (alreadySitting) {
      console.log('we are sitting at table already');
      return table;
    }

    const seatOccupied = table.tableUsers.some((player) => {
      if (player.seat === seat) {
        if (player.userId === user.id) {
          console.log('we are sitting here already');
          return table; // If we're sitting in the checked seat, return the table
        } else {
          console.log('someone is sitting here already');
          return true;
        }
      }
      return false;
    });
  
    if (seatOccupied) {
      return false;
    }


    if (table.players.length < table.Game.maxNumPlayers) {
      const takeSeat = await UserTable.create({
        userId: user.id,
        tableId,
        seat,
      });
      if (!takeSeat) {
        return false;
      }

      const updatedTable = await Table.findByPk(tableId, {
        include: [
          { model: Game },
          { model: UserTable, as: 'tableUsers' },
          {
            model: User,
            as: 'players',
            through: UserTable,
            attributes: ['id', 'username', 'balance', 'rank'],
          },
        ],
      });

      return updatedTable;
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
};

module.exports = {
  gameController,
};
