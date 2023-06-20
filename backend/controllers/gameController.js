const {User, Game, Table, UserTable, Round, Hand, GameSession, Action, Friendship, Pot, UserPot, Message } = require('../db/models');


const gameController = {

  async getGames(){
    const games = await Game.findAll();

    if (!games) {
      const err = new Error('games not found');
      err.statusCode = 404;
      err.status = 404;
      throw err;
    }
    return games;
  },

  async getTablesByType(gameType){

    const tables = await Table.findAll({
      include: [{
        model: Game, 
        where: { gameType }
      }]
    });
    if (!tables) {
      return false
    }
    return tables;
  },

}

module.exports = {
  gameController
}; 