import { GET_FRIEND_ACTIVITY, SET_ACTIVITY_FILTER } from './actionTypes';

export const setFriendActivity = (events, nextCursor) => ({
  type: GET_FRIEND_ACTIVITY,
  payload: { events, nextCursor },
});

export const setActivityFilter = (filter) => ({
  type: SET_ACTIVITY_FILTER,
  payload: filter,
});
