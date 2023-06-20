import { GET_GAMES, GET_TABLES, GET_TABLES_BY_TYPE, GET_GAME_BY_ID, GET_TABLE_BY_ID, JOIN_TABLE} from './actionTypes'



export const getAllGamesAction = (games) => {
  return {
    type: GET_GAMES,
    payload: games.games,
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


export const getTableByIdAction = (table) => {
  return {
    type: GET_TABLE_BY_ID,
    payload: table,

  };
};

export const getTablesByTypeAction = (tables) => {
  console.log(tables);
  return {
    type: GET_TABLES_BY_TYPE,
    payload: tables.tables,
 
  };
};


export const joinTableAction = () => {
  return {
    type: JOIN_TABLE,
  };
};