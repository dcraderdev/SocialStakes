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

  async getTablesByType(gameId){
    console.log('here');
    console.log('here');
    console.log('here');
    console.log('here');
    console.log('here');

    console.log(gameId);
    const tables = await Table.findAll();
    if(tables){

      console.log(tables);
    }
console.log('-=-=-=-=-=-=-=-');
console.log('-=-=-=-=-=-=-=-');
console.log('-=-=-=-=-=-=-=-');
console.log('-=-=-=-=-=-=-=-');
    if (!tables) {
      const err = new Error('tables not found');
      err.statusCode = 404;
      err.status = 404;
      throw err;
    }
    return tables;
  },

}

module.exports = {
  gameController
}; 