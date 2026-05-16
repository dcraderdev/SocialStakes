import { csrfFetch } from './csrf';
import { setFriendActivity } from '../actions/activityActions';

export const getFriendActivity = (limit = 50, cursor = null) => async (dispatch) => {
  try {
    const params = new URLSearchParams({ limit });
    if (cursor) params.set('cursor', cursor);
    const response = await csrfFetch(`/api/friends/activity?${params}`, {
      method: 'GET',
    });
    const data = await response.json();
    dispatch(setFriendActivity(data.events, data.nextCursor));
    return data;
  } catch (error) {
    console.error('Error fetching friend activity:', error);
  }
};
