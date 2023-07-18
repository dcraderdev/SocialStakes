
import { 
  GET_GAMES, GET_GAME_BY_ID, SORT_TABLES,
  GET_TABLES, GET_TABLES_BY_TYPE, GET_TABLE_BY_ID,
  CREATE_TABLE, DELETE_TABLE, UPDATE_TABLE, UPDATE_TABLE_NAME,
  VIEW_TABLE, LEAVE_TABLE, JOIN_TABLE,
  LEAVE_SEAT, TAKE_SEAT, FORFEIT_SEAT,
  SHOW_GAMES, SHOW_TABLES, SHOW_ACTIVE_TABLES, SHOW_CREATING_GAME,
  TOGGLE_SHOW_MESSAGES,
  ADD_BALANCE,
  ADD_BET, REMOVE_LAST_BET, REMOVE_ALL_BET,
  PLAYER_DISCONNECT, PLAYER_RECONNECT,
  REMOVE_PLAYER,
  PLAYER_ADD_TABLE_FUNDS,
  UPDATE_TABLE_COUNTDOWN,
  COLLECT_BETS,
  OFFER_INSURANCE,
  RESCIND_INSURANCE, REMOVE_USER
} from '../actions/actionTypes'



const initialState = {
  games:{},
  tables: {},
  openTablesByGameType: [],
  currentTables: {},
  activeTable: null,
  showGames: true,
  showTables: false,
  showMessages: false,
  showCreatingGame: false
}

const gamesReducer = (state = initialState, action) => {
  const newState = { ...state };

  switch (action.type) {
    case GET_GAMES:{
      const games = action.payload.reduce((acc, game) => {
        if (!acc[game.gameType]) {
          acc[game.gameType] = game;
        }
        return acc;
      }, {});
      return { ...newState, games: games};
    }

    case GET_TABLES_BY_TYPE:{
      return {...newState, openTablesByGameType: action.payload, showGames: false, showTables: true, showActiveTable: false}
    }


    case SORT_TABLES: {
      const {sortBy, direction} = action.payload

      let tablesToSort = [...newState.openTablesByGameType]
    
      tablesToSort.sort((a, b) => {
        switch (sortBy) {
          case 'private':
            // Sort by the length of players array
            return direction === 'high' ? b.private - a.private : a.private - b.private;
          case 'players':
            // Sort by the length of players array
            return direction === 'high' ? b.players.length - a.players.length : a.players.length - b.players.length;
          case 'tableName':
            // Sort by table name alphabetically
            let aName = a.tableName || "";  
            let bName = b.tableName || ""; 
          
            if (aName.toLowerCase() < bName.toLowerCase()) return direction === 'high' ? 1 : -1;
            if (aName.toLowerCase() > bName.toLowerCase()) return direction === 'high' ? -1 : 1;
            return 0;
          case 'deckSize':
            // Sort by deck size
            return direction === 'high' ? b.Game.decksUsed - a.Game.decksUsed : a.Game.decksUsed - b.Game.decksUsed;
          case 'minMax':
            // Sort by minMax
            let aMinMax = a.Game.minBet + a.Game.maxBet;
            let bMinMax = b.Game.minBet + b.Game.maxBet;
            return direction === 'high' ? bMinMax - aMinMax : aMinMax - bMinMax;
          default:
            return 0;
        }
      });
    
      return { ...newState, openTablesByGameType: tablesToSort }
    }
    




    case REMOVE_USER:{
      const newGames = {...newState.games}
      return {...initialState, games: newGames}
    }


    case CREATE_TABLE:{
      
      const table = action.payload.table

      let updatedCurrentTables = {...newState.currentTables};
      updatedCurrentTables[table.id] = table
      updatedCurrentTables[table.id].messages = []


      return {...newState, currentTables:updatedCurrentTables, showCreatingGame:false, showGames: false, showTables: false, showActiveTable: true}
    }

    case UPDATE_TABLE_NAME:{
      const {tableId, tableName} = action.payload
      let updatedCurrentTables = {...newState.currentTables};
      const currentTable = updatedCurrentTables[tableId];
      currentTable.tableName = tableName
      return {...newState, currentTables: updatedCurrentTables}
    }


    
    // case DELETE_TABLE:{
    //   const tableId = action.payload
    //   let updatedCurrentTables = {...newState.currentTables};
    //   delete updatedCurrentTables[tableId]

    //   //Check if any tables left, if so switch to the first one
    //   const tableIds = Object.keys(updatedCurrentTables);
    //   let activeTable = null;
    //   if (tableIds.length > 0) {
    //     activeTable = updatedCurrentTables[tableIds[0]];
    //     return { ...newState, currentTables: updatedCurrentTables, activeTable };
    //   }
    //   return { ...newState, currentTables: updatedCurrentTables, activeTable, showGames: true, showTables: false };

    // }


 
    
    case UPDATE_TABLE:{
      const {tableId, table} = action.payload
      // console.log('-=-=-=-=-=-=-=-=-=');
      // console.log('-=-=-=-=-=-=-=-=-=');
      // console.log(action.payload);
      // console.log('-=-=-=-=-=-=-=-=-=');
      // console.log('-=-=-=-=-=-=-=-=-=');

      let updatedCurrentTables = {...newState.currentTables};


      if (updatedCurrentTables[tableId]) {
        const currentTable = updatedCurrentTables[tableId];

        // console.log(currentTable.tableUsers[4]?.cards);
        // console.log(table?.seats[4]?.cards);
        currentTable.tableUsers = table.seats


        currentTable.countdownEnd = table.countdownEnd;
        currentTable.dealerCards = action.payload.table.dealerCards?.visibleCards;
        currentTable.actionSeat = action.payload.table.actionSeat;
        // currentTable.actionTimer = action.payload.table.actionTimer;
        currentTable.actionEnd = action.payload.table.actionEnd;
        currentTable.actionHand = action.payload.table.actionHand;
        
        // only update handInProgress if specified in payload
        if(action.payload.table.handInProgress !== null && action.payload.table.handInProgress !== undefined){
          currentTable.handInProgress = action.payload.table.handInProgress;
        }
        // Replace the table in currentTables with the updated table
        updatedCurrentTables[tableId] = currentTable;
      }
      return {...newState, currentTables: updatedCurrentTables}
    }
    

    case VIEW_TABLE:{
      return {...newState, activeTable:action.payload, showGames: false, showTables: false, showActiveTable: true, showCreatingGame:false}
    }

    case JOIN_TABLE:{
      let newCurrentTables = {...newState.currentTables}
      newCurrentTables[action.payload.id] = action.payload
      newCurrentTables[action.payload.id].messages = []
      return {...newState, currentTables: newCurrentTables, activeTable:action.payload, showGames: false, showTables: false, showActiveTable: true}
    }


    case LEAVE_TABLE: {
      let newCurrentTables = { ...newState.currentTables };
      let activeTable = { ...newState.activeTable}

      delete newCurrentTables[action.payload];

      // if active table still exists dont switch
      if(newCurrentTables[activeTable.id]){
        return { ...newState, currentTables: newCurrentTables, activeTable};
      } else {
      //Check if any tables left, if so switch to the first one
      const tableIds = Object.keys(newCurrentTables);
      let activeTable = null;
      if (tableIds.length > 0) {
          activeTable = newCurrentTables[tableIds[0]];
          return { ...newState, currentTables: newCurrentTables, activeTable };
      }
      return { ...newState, currentTables: newCurrentTables, activeTable, showGames: true, showTables: false };
      }
    }

    case TAKE_SEAT: {
      const {id, seat, tableId} = action.payload
      const newTableUser = action.payload;

      const newCurrentTables = { ...newState.currentTables };
      if (newCurrentTables[tableId]) {
        if (!newCurrentTables[tableId].tableUsers) {
          newCurrentTables[tableId].tableUsers = {}
        }
        // Assign newTableUser to seat in tableUsers obj of the active table
        newCurrentTables[tableId].tableUsers[seat] = newTableUser;
        newCurrentTables[tableId].currentSeat = seat;
      }

      return { ...newState, currentTables: newCurrentTables };
    }

    case FORFEIT_SEAT: {
      const {tableId, seat, currentTimer} = action.payload
      const newCurrentTables = { ...newState.currentTables };
      let currentTable = { ...newCurrentTables[tableId]}

      currentTable.actionTimer = currentTimer;

      if (currentTable.tableUsers?.[seat]) {
        currentTable.tableUsers[seat].forfeit = true;
      }

      newCurrentTables[tableId] = currentTable;

      return { ...newState, currentTables: newCurrentTables };
    }
    
 
    case SHOW_GAMES:{
      return {...newState, showCreatingGame:false, showGames: true, showTables: false, activeTable: null}
    }
    case SHOW_TABLES:{
      return {...newState, showCreatingGame:false, showGames: false, showTables: true, activeTable: null}
    }

    case SHOW_CREATING_GAME:{
      return {...newState, showCreatingGame:true, showGames: false, showTables: false, activeTable: null}
    }

    case TOGGLE_SHOW_MESSAGES:{
      let toggle = !newState.showMessages
      return {...newState, showMessages: toggle}
    }

    case ADD_BET: {
      const { bet, tableId, seat } = action.payload;
    
      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };
    
      const playerSeat = { ...newCurrentTable.tableUsers[seat] };
      playerSeat.pendingBet += bet;
      playerSeat.tableBalance -= bet;
    
      newCurrentTable.tableUsers[seat] = playerSeat;
      newCurrentTables[tableId] = newCurrentTable;
    
      return { ...newState, currentTables: newCurrentTables };
    }

    case REMOVE_LAST_BET: {
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

    case PLAYER_DISCONNECT: {
      const {seat, tableId, timer} = action.payload;

      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };
    
      const playerSeat = { ...newCurrentTable.tableUsers[seat] };
      playerSeat.disconnectTimer = timer;
    
      newCurrentTable.tableUsers[seat] = playerSeat;
      newCurrentTables[tableId] = newCurrentTable;
    
      return { ...newState, currentTables: newCurrentTables };
    }

    case PLAYER_RECONNECT: {
      const {seat, tableId, timer} = action.payload;

    
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



    case PLAYER_ADD_TABLE_FUNDS: {
      const {seat, tableId, amount} = action.payload;
      
      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };
      
      const newCurrentSeat = newCurrentTable.tableUsers[seat];
      newCurrentSeat.tableBalance += amount;
      
      return { ...newState, currentTables: newCurrentTables };
    }

    case UPDATE_TABLE_COUNTDOWN: {

      const {countdownEnd, tableId} = action.payload;

      console.log(action.payload);

      
      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };


      newCurrentTable.countdownEnd = countdownEnd
      newCurrentTables[tableId] = newCurrentTable;

      
      return { ...newState, currentTables: newCurrentTables };
    }

    case COLLECT_BETS: {

      const {countdownRemaining, tableId} = action.payload;
      
      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };

      newCurrentTable.countdown = countdownRemaining
      newCurrentTables[tableId] = newCurrentTable;

      return { ...newState, currentTables: newCurrentTables };
    }
    

    case OFFER_INSURANCE: {
      const tableId = action.payload;
      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };
      newCurrentTable.insuranceOffered = true
      newCurrentTables[tableId] = newCurrentTable;
      return { ...newState, currentTables: newCurrentTables };
    }

    case RESCIND_INSURANCE: {
      const tableId = action.payload;
      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };
      newCurrentTable.insuranceOffered = false
      newCurrentTables[tableId] = newCurrentTable;
      return { ...newState, currentTables: newCurrentTables };
    }


  
    default:
      return newState;
  }
};

export default gamesReducer;