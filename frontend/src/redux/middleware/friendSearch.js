import { csrfFetch } from './csrf';
import {
  setUserSearchResultsAction,
  clearUserSearchResultsAction,
  setFriendSuggestionsAction,
  optimisticSuggestAddAction,
} from '../actions/friendActions';

export const searchUsers = (query) => async (dispatch) => {
  if (!query || query.trim().length < 2) {
    dispatch(clearUserSearchResultsAction());
    return;
  }

  try {
    const response = await csrfFetch(
      `/api/users/search?q=${encodeURIComponent(query.trim())}`,
      { method: 'GET' }
    );
    const data = await response.json();
    dispatch(setUserSearchResultsAction(data.users || []));
    return data.users || [];
  } catch (err) {
    dispatch(clearUserSearchResultsAction());
  }
};

export const getFriendSuggestions = () => async (dispatch) => {
  try {
    const response = await csrfFetch('/api/friends/suggestions', {
      method: 'GET',
    });
    const data = await response.json();
    dispatch(setFriendSuggestionsAction(data.suggestions || []));
    return data.suggestions || [];
  } catch (err) {
    dispatch(setFriendSuggestionsAction([]));
  }
};

export const optimisticAddSuggestion = (userId) => (dispatch) => {
  dispatch(optimisticSuggestAddAction(userId));
};
