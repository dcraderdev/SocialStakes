import { REMOVE_USER, SET_USER, SET_THEMES, CHANGE_NEON_THEME, CHANGE_TABLE_THEME, GET_USER_STATS } from './actionTypes'



export const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user,
  };
};

export const removeUser = () => {
  return {
    type: REMOVE_USER,
  };
};


export const setThemes = (data) => {
  return {
    type: SET_THEMES,
    payload: data.themeUrls
  };
};

export const changeNeonThemeAction = (theme) => {
  return {
    type: CHANGE_NEON_THEME,
    payload: theme
  };
};

export const changeTableThemeAction = (theme) => {
  return {
    type: CHANGE_TABLE_THEME,
    payload: theme
  };
};


export const getUserStatsAction = (stats) => {
  return {
    type: GET_USER_STATS,
    payload: stats
  };
};
