import { REMOVE_USER, SET_USER, SET_THEMES } from './actionTypes'



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


