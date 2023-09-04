
import { 
 GET_USER_STATS, GET_USER_TABLES
} from '../actions/actionTypes'


const initialState = {
  history: {},
  tables: {},
  sessionStats: {}
};

const statsReducer = (state = initialState, action) => {
  const newState = { ...state };
  switch (action.type) {


    case GET_USER_STATS: {
      console.log(action.payload);

      let newStats = action.payload
      return { ...newState, history:newStats};
    }



    case GET_USER_TABLES: {
      console.log(action.payload);

      let newSessionStats = action.payload.sessionStats
      return { ...newState, sessionStats:newSessionStats };
    }



    



    default:
      return newState;


    }
};

export default statsReducer;