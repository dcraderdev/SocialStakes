import { GET_GAMES, GET_TABLE } from './actionTypes'



export const getGames = (user) => {
  return {
    type: GET_GAMES,
    payload: user,
  };
};

export const getTable = () => {
  return {
    type: GET_TABLE,
  };
};


