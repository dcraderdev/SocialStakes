import { 
  GET_GAME_BY_ID, GET_GAMES,
  GET_TABLE_BY_ID, GET_TABLES, GET_TABLES_BY_TYPE,
  UPDATE_TABLE, CREATE_TABLE, DELETE_TABLE,
  VIEW_TABLE, LEAVE_TABLE, JOIN_TABLE,
  TAKE_SEAT, LEAVE_SEAT, CHANGE_SEAT, FORFEIT_SEAT,
  SHOW_GAMES, SHOW_TABLES, SHOW_ACTIVE_TABLES, SHOW_CREATING_GAME,
  ADD_MESSAGE, TOGGLE_SHOW_MESSAGES,
  ADD_BALANCE,
  ADD_BET, REMOVE_LAST_BET, REMOVE_ALL_BET,
  PLAYER_DISCONNECT, PLAYER_RECONNECT,
  REMOVE_PLAYER,
  PLAYER_ADD_TABLE_FUNDS,
  UPDATE_TABLE_COUNTDOWN,
  COLLECT_BETS,
  OFFER_INSURANCE, RESCIND_INSURANCE

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
  return {
    type: GET_TABLES_BY_TYPE,
    payload: data.tables,
 
  };
}

export const createTableAction = (data) => {
  console.log(data);
  
  return {
    type: CREATE_TABLE,
    payload: data,
  };
};

export const deleteTableAction = (data) => {
  console.log(data);
  return {
    type: DELETE_TABLE,
    payload: data,
  };
};
;



export const updateTableAction = (data) => {
  console.log(data);
  return {
    type: UPDATE_TABLE,
    payload: data,
  };
};


  export const viewTableAction = (tableId) => {
    console.log(tableId);
    return {
      type: VIEW_TABLE,
      payload: tableId,
    };
  };

  export const joinTableAction = (data) => {
    console.log(data);
    return {
      type: JOIN_TABLE,
      payload: data,
    };
  };

  export const leaveTableAction = (tableId) => {
    return {
      type: LEAVE_TABLE,
      payload: tableId,
    };
  };

export const takeSeatAction = (seatObj) => {
  return {
    type: TAKE_SEAT,
    payload: seatObj,
  };
};

export const leaveSeatAction = (seatObj) => {
  return {
    type: LEAVE_SEAT,
    payload: seatObj,
  };
};

export const forfeitSeatAction = (leaveSeatObj) => {
  return {
    type: FORFEIT_SEAT,
    payload: leaveSeatObj,
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

export const showCreatingGameAction = () => {
  return {
    type: SHOW_CREATING_GAME
  };
};

export const toggleShowMessages = () => {
  return {
    type: TOGGLE_SHOW_MESSAGES
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


export const addBalanceAction = () => {
  return {
    type: ADD_BALANCE
  };
};


export const addBetAction = (betObj) => {
  return {
    type: ADD_BET,
    payload: betObj
  };
};

export const removeLastBetAction = (betObj) => {
  return {
    type: REMOVE_LAST_BET,
    payload: betObj
  };
};

export const removeAllBetAction = (betObj) => {
  return {
    type: REMOVE_ALL_BET,
    payload: betObj
  };
};

export const playerDisconnectAction = ({seat, tableId, timer}) => {
  return {
    type: PLAYER_DISCONNECT,
    payload: {seat, tableId, timer}
  };
};


export const playerReconnectAction = ({seat, tableId, timer}) => {
  return {
    type: PLAYER_RECONNECT,
    payload: {seat, tableId, timer}
  };
};

export const removePlayerAction = (leaveSeatObj) => {
  return {
    type: REMOVE_PLAYER,
    payload: leaveSeatObj
  };
};

export const playerAddTableFundsAction = (seatObj) => {
  return {
    type: PLAYER_ADD_TABLE_FUNDS,
    payload: seatObj
  };
};


export const updateTableCountdownAction = (countdownObj) => {
  return {
    type: UPDATE_TABLE_COUNTDOWN,
    payload: countdownObj
  };
};

export const collectBetsAction = (countdownObj) => {
  return {
    type: COLLECT_BETS,
    payload: countdownObj
  };
};


export const offerInsuranceAction = (tableId) => {
  return {
    type: OFFER_INSURANCE,
    payload: tableId
  };
};

export const rescindInsuranceAction = (tableId) => {
  return {
    type: RESCIND_INSURANCE,
    payload: tableId
  };
};