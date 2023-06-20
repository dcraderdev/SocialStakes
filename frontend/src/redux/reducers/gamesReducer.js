import { GET_GAMES, GET_TABLES, GET_TABLES_BY_TYPE, GET_GAME_BY_ID, GET_TABLE_BY_ID, JOIN_TABLE } from '../actions/actionTypes'

const initialState = {
  games:{},
  tables: {},
  currentTableList: []
}

const gamesReducer = (state = initialState, action) => {
  const newState = { ...state };

  switch (action.type) {
    case GET_GAMES:{
      console.log(action.payload);
      const games = action.payload.reduce((acc, game) => {
        if (!acc[game.gameType]) {
          acc[game.gameType] = game;
        }
        return acc;
      }, {});
      return { ...newState, games: games};
    }

    case GET_TABLES_BY_TYPE:{
      console.log(action.payload);
      return {...newState, currentTableList: action.payload}
    }



  
    default:
      return newState;
  }
};

export default gamesReducer;