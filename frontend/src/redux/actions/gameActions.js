import { 
  GET_GAME_BY_ID, GET_GAMES,
  GET_TABLE_BY_ID, GET_TABLES, GET_TABLES_BY_TYPE,
  TAKE_SEAT, LEAVE_SEAT, CHANGE_SEAT
} from './actionTypes'



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

// Needs backend route
export const getTableByIdAction = (table) => {
  return {
    type: GET_TABLE_BY_ID,
    payload: table,

  };
};

export const getTablesByTypeAction = (data) => {
  console.log(data.tables);
  return {
    type: GET_TABLES_BY_TYPE,
    payload: data.tables,
 
  };
};


export const takeSeatAction = (data) => {
  console.log(data.table);
  return {
    type: TAKE_SEAT,
    payload: data.table,
  };
};

export const leaveSeatAction = (table) => {
  return {
    type: LEAVE_SEAT,
    payload: table,
  };
};

export const changeSeatAction = (table) => {
  return {
    type: CHANGE_SEAT,
    payload: table,
  };
};