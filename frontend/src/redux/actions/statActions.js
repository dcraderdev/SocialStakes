import {
  GET_USER_STATS,
  GET_USER_TABLES,
  GET_HISTORY_STATS,
  GET_HAND_HISTORY,
  GET_FRIENDS_LEADERBOARD,
  GET_HAND_VERIFY,
  SET_HISTORY_LOADING,
} from './actionTypes';


export const getUserTablesAction = (stats) => ({ type: GET_USER_TABLES, payload: stats });
export const getUserStatsAction = (stats) => ({ type: GET_USER_STATS, payload: stats });

export const setHistoryStatsAction = (data) => ({ type: GET_HISTORY_STATS, payload: data });
export const setHandHistoryAction = (data) => ({ type: GET_HAND_HISTORY, payload: data });
export const setFriendsLeaderboardAction = (data) => ({ type: GET_FRIENDS_LEADERBOARD, payload: data });
export const setHandVerifyAction = (data) => ({ type: GET_HAND_VERIFY, payload: data });
export const setHistoryLoadingAction = (loading) => ({ type: SET_HISTORY_LOADING, payload: loading });


