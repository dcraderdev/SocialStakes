import { GET_GAMES, GET_TABLES, GET_GAME_BY_ID, GET_TABLE_BY_ID, JOIN_TABLE } from '../actions/actionTypes'

const initialState = {
  games:{},
  tables: {}
}

const gamesReducer = (state = initialState, action) => {
  const newState = { ...state };

  switch (action.type) {
    case GET_GAMES:{
      console.log(action);
      return { ...newState, games: action.games};
    }

  
    default:
      return newState;
  }
};

export default gamesReducer;