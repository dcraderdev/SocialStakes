import { GET_GAMES, GET_TABLE } from '../actions/actionTypes'

const initialState = {
  games:{},
  tables: {}
}

const gamesReducer = (state = initialState, action) => {
  const newState = { ...state };

  switch (action.type) {
    case GET_GAMES:{

    }

  
    default:
      return newState;
  }
};

export default gamesReducer;