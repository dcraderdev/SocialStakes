import {
  getUserStatsAction,
  getUserTablesAction,
  setHistoryStatsAction,
  setHandHistoryAction,
  setFriendsLeaderboardAction,
  setHandVerifyAction,
  setHistoryLoadingAction,
} from '../actions/statActions';
import { csrfFetch } from './csrf';

export const getUserStats = () => async (dispatch) => {
  try {
    const response = await csrfFetch('/api/session/stats');
    const data = await response.json();
    dispatch(getUserStatsAction(data));
    return response;
  } catch (error) {
    console.error(error);
  }
};

export const getUserTables = () => async (dispatch) => {
  try {
    const response = await csrfFetch('/api/session/tables');
    const data = await response.json();
    dispatch(getUserTablesAction(data));
    return response;
  } catch (error) {
    console.error(error);
  }
};

export const loadHistoryStats = (days = 30) => async (dispatch) => {
  dispatch(setHistoryLoadingAction(true));
  try {
    const response = await csrfFetch(`/api/users/me/stats?days=${days}`);
    const data = await response.json();
    dispatch(setHistoryStatsAction(data));
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setHistoryLoadingAction(false));
  }
};

export const loadHandHistory = (limit = 50) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/users/me/hands?limit=${limit}`);
    const data = await response.json();
    dispatch(setHandHistoryAction(data.hands || []));
  } catch (error) {
    console.error(error);
  }
};

export const loadFriendsLeaderboard = () => async (dispatch) => {
  try {
    const response = await csrfFetch('/api/users/me/friends/leaderboard');
    const data = await response.json();
    dispatch(setFriendsLeaderboardAction(data.leaderboard || []));
  } catch (error) {
    console.error(error);
  }
};

export const loadHandVerify = (handId) => async (dispatch) => {
  dispatch(setHandVerifyAction(null));
  try {
    const response = await csrfFetch(`/api/hands/${handId}/verify`);
    if (!response.ok) {
      dispatch(setHandVerifyAction({ error: 'Hand not found' }));
      return;
    }
    const data = await response.json();
    dispatch(setHandVerifyAction(data));
  } catch (error) {
    console.error(error);
    dispatch(setHandVerifyAction({ error: 'Failed to load verification data' }));
  }
};
