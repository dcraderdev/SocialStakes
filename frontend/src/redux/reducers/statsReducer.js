import {
  GET_USER_STATS,
  GET_USER_TABLES,
  GET_HISTORY_STATS,
  GET_HAND_HISTORY,
  GET_FRIENDS_LEADERBOARD,
  GET_HAND_VERIFY,
  SET_HISTORY_LOADING,
} from '../actions/actionTypes';

const initialState = {
  history: {},
  tables: {},
  sessionStats: {},
  historyStats: null,
  handHistory: [],
  friendsLeaderboard: [],
  handVerify: null,
  historyLoading: false,
};

const statsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_USER_STATS:
      return { ...state, history: action.payload };

    case GET_USER_TABLES:
      return { ...state, sessionStats: action.payload.sessionStats };

    case GET_HISTORY_STATS:
      return { ...state, historyStats: action.payload };

    case GET_HAND_HISTORY:
      return { ...state, handHistory: action.payload };

    case GET_FRIENDS_LEADERBOARD:
      return { ...state, friendsLeaderboard: action.payload };

    case GET_HAND_VERIFY:
      return { ...state, handVerify: action.payload };

    case SET_HISTORY_LOADING:
      return { ...state, historyLoading: action.payload };

    default:
      return state;
  }
};

export default statsReducer;
