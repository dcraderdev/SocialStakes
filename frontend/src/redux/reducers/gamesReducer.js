import { GET_GAMES, GET_TABLES, GET_TABLES_BY_TYPE, GET_GAME_BY_ID, GET_TABLE_BY_ID, JOIN_TABLE } from '../actions/actionTypes'

const initialState = {
  games:{},
  tables: {}
}

const gamesReducer = (state = initialState, action) => {
  const newState = { ...state };

  switch (action.type) {
    case GET_GAMES:{
      console.log(action.payload);
      const games = action.payload.reduce((acc, game) => {
        if (game.active) {
          if (game.gameType === 'blackjack') {
            if (game.maxNumPlayers > 1) {
              if(!acc['multiPlayerBlackjack']){
                acc['multiPlayerBlackjack'] = {}
              }
              acc['multiPlayerBlackjack'][game.variant] = game;
            } else {
              if(!acc['singlePlayerBlackjack']){
                acc['singlePlayerBlackjack'] = {}
              }
              acc['singlePlayerBlackjack'][game.variant] = game;
            }
          } else {
            if (!acc[game.gameType]) {
              acc[game.gameType] = {};
            }
            acc[game.gameType][game.variant] = game;
          }
        }
        return acc;
      }, {});
      return { ...newState, games: games};
    }

    case GET_TABLES_BY_TYPE:{
      console.log(action.payload);
      return newState
    }



  
    default:
      return newState;
  }
};

export default gamesReducer;