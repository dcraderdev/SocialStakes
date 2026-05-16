import { GET_FRIEND_ACTIVITY, SET_ACTIVITY_FILTER } from '../actions/actionTypes';

const initialState = {
  events: [],
  nextCursor: null,
  filter: 'all',
};

const activityReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_FRIEND_ACTIVITY:
      return {
        ...state,
        events: action.payload.events,
        nextCursor: action.payload.nextCursor,
      };
    case SET_ACTIVITY_FILTER:
      return {
        ...state,
        filter: action.payload,
      };
    default:
      return state;
  }
};

export default activityReducer;
