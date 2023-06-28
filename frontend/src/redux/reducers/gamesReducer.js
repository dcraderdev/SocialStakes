import { 
  GET_GAMES, GET_GAME_BY_ID,
  GET_TABLES, GET_TABLES_BY_TYPE, GET_TABLE_BY_ID,
  VIEW_TABLE, LEAVE_TABLE, 
  LEAVE_SEAT, TAKE_SEAT,
  SHOW_GAMES, SHOW_TABLES, SHOW_ACTIVE_TABLES,
  ADD_MESSAGE, TOGGLE_SHOW_MESSAGES,
  ADD_BALANCE,
  ADD_BET, REMOVE_BET, REMOVE_ALL_BET,
  SHOW_DISCONNECT_TIMER, REMOVE_DISCONNECT_TIMER,
  REMOVE_PLAYER
 } from '../actions/actionTypes'

const initialState = {
  games:{},
  tables: {},
  openTablesByGameType: [],
  currentTables: {},
  activeTable: null,
  showGames: true,
  showTables: false,
  showMessages: true,
}

const gamesReducer = (state = initialState, action) => {
  const newState = { ...state };

  switch (action.type) {
    case GET_GAMES:{
      console.log(action.payload);
      const games = action.payload.reduce((acc, game) => {
        if (!acc[game.gameType]) {
          acc[game.gameType] = game;
        }
        return acc;
      }, {});
      return { ...newState, games: games};
    }

    case GET_TABLES_BY_TYPE:{
      console.log(action.payload);
      return {...newState, openTablesByGameType: action.payload, showGames: false, showTables: true, showActiveTable: false}
    }

    case VIEW_TABLE:{
      console.log('asd');
      console.log(action.payload);
      let newCurrentTables = {...newState.currentTables}
      newCurrentTables[action.payload.id] = action.payload
      newCurrentTables[action.payload.id].messages = []
      return {...newState, currentTables: newCurrentTables, activeTable:action.payload, showGames: false, showTables: false, showActiveTable: true}
    }
    case LEAVE_TABLE: {
      console.log('leaving');
    
      console.log(action.payload);
      let newCurrentTables = { ...newState.currentTables };

      delete newCurrentTables[action.payload];
        //Check if any tables left, if so switch to the first one
      const tableIds = Object.keys(newCurrentTables);
      let activeTable = null;
      console.log(newCurrentTables);
      
      if (tableIds.length > 0) {
        activeTable = newCurrentTables[tableIds[0]];
        return { ...newState, currentTables: newCurrentTables, activeTable };
      }
      return { ...newState, currentTables: newCurrentTables, activeTable, showGames: true, showTables: false };
    
    }

    case TAKE_SEAT: {
      const {id, seat, tableBalance, tableId, userId, username } = action.payload
      const newTableUser = action.payload;

      // Create a copy of the currentTables object
      const newCurrentTables = { ...newState.currentTables };
      // Check if the active table exists in newCurrentTables
      if (newCurrentTables[tableId]) {
        // Assign newTableUser to seat in tableUsers obj of the active table
        newCurrentTables[tableId].tableUsers[seat] = newTableUser;
        newCurrentTables[tableId].currentSeat = seat;
      }

      return { ...newState, currentTables: newCurrentTables };
    }




    case LEAVE_SEAT:{
      console.log(action.payload);
      const {seat, tableId} = action.payload
      // Create a copy of the currentTables object
      const newCurrentTables = { ...newState.currentTables };

      // Check if the active table exists in newCurrentTables
      if (newCurrentTables[tableId]) {
        // Remove the seat from the tableUsers object
        delete newCurrentTables[tableId].tableUsers[seat];
      }

      return { ...newState, currentTables: newCurrentTables };
    }




    case SHOW_GAMES:{
      return {...newState, showGames: true, showTables: false, activeTable: null}
    }
    case SHOW_TABLES:{
      return {...newState, showGames: false, showTables: true, activeTable: null}
    }
    case TOGGLE_SHOW_MESSAGES:{
      let toggle = !newState.showMessages
      return {...newState, showMessages: toggle}
    }

    case ADD_MESSAGE: {
      console.log('adding message');
      console.log(action.payload);
      const { room, content, user } = action.payload;
      const newCurrentTables = { ...newState.currentTables };
    
      if (newCurrentTables[room]) {
        const newMessage = { content, user: {username: user.username, id: user.id} };
        newCurrentTables[room].messages.push(newMessage);
      }

      console.log(newCurrentTables);
    
      return { ...newState, currentTables: newCurrentTables };
    }

    case ADD_BET: {
      const { bet, tableId, user, seat } = action.payload;
    
      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };
    
      const playerSeat = { ...newCurrentTable.tableUsers[seat] };
      playerSeat.pendingBet += bet;
      playerSeat.tableBalance -= bet;
    
      newCurrentTable.tableUsers[seat] = playerSeat;
      newCurrentTables[tableId] = newCurrentTable;
    
      return { ...newState, currentTables: newCurrentTables };
    }

    case REMOVE_BET: {
      const { tableId, seat, lastBet } = action.payload;
    
      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };
    
      const playerSeat = { ...newCurrentTable.tableUsers[seat] };
      playerSeat.pendingBet -= lastBet;
      playerSeat.tableBalance += lastBet;
    
      newCurrentTable.tableUsers[seat] = playerSeat;
      newCurrentTables[tableId] = newCurrentTable;
    
      return { ...newState, currentTables: newCurrentTables };
    }
    
    case REMOVE_ALL_BET: {
      const { tableId, seat } = action.payload;
    
      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };
    
      const playerSeat = { ...newCurrentTable.tableUsers[seat] };
      playerSeat.tableBalance += playerSeat.pendingBet;
      playerSeat.pendingBet = 0;
    
      newCurrentTable.tableUsers[seat] = playerSeat;
      newCurrentTables[tableId] = newCurrentTable;
    
      return { ...newState, currentTables: newCurrentTables };
    }

    case SHOW_DISCONNECT_TIMER: {
      const {seat, tableId, timer} = action.payload;

      console.log(seat);
      console.log(tableId);
      console.log(timer);
    
      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };
    
      const playerSeat = { ...newCurrentTable.tableUsers[seat] };
      playerSeat.disconnectTimer = timer;
    
      newCurrentTable.tableUsers[seat] = playerSeat;
      newCurrentTables[tableId] = newCurrentTable;
    
      return { ...newState, currentTables: newCurrentTables };
    }
    
    case REMOVE_PLAYER: {
      const {seat, tableId} = action.payload;
      
      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };
      
      delete newCurrentTable.tableUsers[seat];
      newCurrentTables[tableId] = newCurrentTable;
      
      return { ...newState, currentTables: newCurrentTables };
    }

  
    default:
      return newState;
  }
};

export default gamesReducer;