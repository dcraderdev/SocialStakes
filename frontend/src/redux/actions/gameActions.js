import { GET_GAMES, GET_TABLES, GET_GAME_BY_ID, GET_TABLE_BY_ID, JOIN_TABLE} from './actionTypes'



export const getAllGamesAction = (games) => {
  return {
    type: GET_GAMES,
    payload: games,
  };
};
export const getGameByIdAction = (game) => {
  return {
    type: GET_GAME_BY_ID,
    payload: game,
  };
};



export const getAllTablesAction = () => {
  return {
    type: GET_TABLES,
  };
};


export const getTableByIdAction = () => {
  return {
    type: GET_TABLE_BY_ID,
  };
};



export const joinTableAction = () => {
  return {
    type: JOIN_TABLE,
  };
};