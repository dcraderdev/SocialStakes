import { GET_USER_STATS, GET_USER_TABLES } from './actionTypes'


export const getUserTablesAction = (stats) => {
  return {
    type: GET_USER_TABLES,
    payload: stats
  };
};

export const getUserStatsAction = (stats) => {
  return {
    type: GET_USER_STATS,
    payload: stats
  };
};


