import { 
  GET_GAMES, GET_GAME_BY_ID,
  GET_TABLES, GET_TABLES_BY_TYPE, GET_TABLE_BY_ID, 
  LEAVE_SEAT, TAKE_SEAT
 } from '../actions/actionTypes'

const initialState = {
  games:{},
  tables: {},
  openTablesByGameType: [],
  currentTables: {}
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
      return {...newState, openTablesByGameType: action.payload}
    }
    case TAKE_SEAT:{
      console.log(action.payload);
      return {...newState}
    }
    case LEAVE_SEAT:{
      console.log(action.payload);
      return {...newState}
    }
    // myabe HANDLE_SEAT_CHANGE?
    // case UPDATE_CURRENT_TABLES:{
    //   return newState
    // }



  
    default:
      return newState;
  }
};

export default gamesReducer;