import { 
  GET_GAME_BY_ID, GET_GAMES,
  GET_TABLE_BY_ID, GET_TABLES, GET_TABLES_BY_TYPE,
  VIEW_TABLE, LEAVE_TABLE,
  TAKE_SEAT, LEAVE_SEAT, CHANGE_SEAT,
  SHOW_GAMES, SHOW_TABLES, SHOW_ACTIVE_TABLES,
  ADD_MESSAGE
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


export const getTableByIdAction = (data) => {
  return {
    type: GET_TABLE_BY_ID,
    payload: data.table,
  };
};

export const getTablesByTypeAction = (data) => {
  console.log(data.tables);
  return {
    type: GET_TABLES_BY_TYPE,
    payload: data.tables,
 
  };
};



  export const viewTableAction = (data) => {
    console.log(data);

    console.log(data.table);
    return {
      type: VIEW_TABLE,
      payload: data.table,
    };
  };

  export const leaveTableAction = (tableId) => {
  console.log('leaving');

    return {
      type: LEAVE_TABLE,
      payload: tableId,
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




export const showGamesAction = () => {
  return {
    type: SHOW_GAMES
  };
};

export const showTablesAction = () => {
  return {
    type: SHOW_TABLES
  };
};

export const changeActiveTablesAction = () => {
  return {
    type: SHOW_ACTIVE_TABLES
  };
};
export const addMessageAction = (messageObj) => {
  console.log('here');
  console.log(messageObj);

  return {
    type: ADD_MESSAGE,
    payload: messageObj
  };
};