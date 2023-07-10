import { 
  GET_GAMES, GET_GAME_BY_ID,
  GET_TABLES, GET_TABLES_BY_TYPE, GET_TABLE_BY_ID,
  CREATE_TABLE, DELETE_TABLE, UPDATE_TABLE,
  VIEW_TABLE, LEAVE_TABLE, JOIN_TABLE,
  LEAVE_SEAT, TAKE_SEAT, FORFEIT_SEAT,
  SHOW_GAMES, SHOW_TABLES, SHOW_ACTIVE_TABLES, SHOW_CREATING_GAME,
  ADD_MESSAGE, TOGGLE_SHOW_MESSAGES,
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
  showMessages: true,
  showCreatingGame: false
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

    case REMOVE_USER:{
      const newGames = {...newState.games}
      return {...initialState, games: newGames}
    }


    case CREATE_TABLE:{
      const newGames = {...newState.games}
      return {...initialState, games: newGames}
    }

    case DELETE_TABLE:{
      const newGames = {...newState.games}
      return {...initialState, games: newGames}
    }



    
    case UPDATE_TABLE:{
      const {tableId, table} = action.payload
      console.log('-=-=-=-=-=-=-=-=-=');
      console.log('-=-=-=-=-=-=-=-=-=');
      console.log(action.payload);
      console.log('-=-=-=-=-=-=-=-=-=');
      console.log('-=-=-=-=-=-=-=-=-=');

      let updatedCurrentTables = {...newState.currentTables};

      console.log(updatedCurrentTables);

      if (updatedCurrentTables[tableId]) {
        console.log('yes');
        const currentTable = updatedCurrentTables[tableId];

        // console.log(currentTable.tableUsers[4]?.cards);
        // console.log(table?.seats[4]?.cards);
        currentTable.tableUsers = table.seats


        currentTable.countdown = table.countdownRemaining;
        currentTable.dealerCards = action.payload.table.dealerCards?.visibleCards;
        currentTable.actionSeat = action.payload.table.actionSeat;
        currentTable.actionTimer = action.payload.table.actionTimer;
        currentTable.actionHand = action.payload.table.actionHand;
        
        // only update handInProgress if specified in payload
        if(action.payload.table.handInProgress !== null && action.payload.table.handInProgress !== undefined){
          currentTable.handInProgress = action.payload.table.handInProgress;
        }
    
        // for(let seat in currentTable.tableUsers) {

        //   // console.log(seat);
        //   // console.log(table.seats[seat].pendingBet);

        //   // If the incoming table has data for this seat, update it in the currentTable
        //   if (table.seats[seat] && table.seats[seat].hands) {
        //     currentTable.tableUsers[seat].hands = table.seats[seat].hands;
        //   }

        //   if (table.seats[seat]) {
        //     currentTable.tableUsers[seat].cards = table.seats[seat].cards;
        //     // currentTable.tableUsers[seat].hands = table.seats[seat].hands;
        //     currentTable.tableUsers[seat].pendingBet = table.seats[seat].pendingBet;
        //     currentTable.tableUsers[seat].currentBet = table.seats[seat].currentBet;
        //     currentTable.tableUsers[seat].tableBalance = table.seats[seat].tableBalance;
        //   }
        // } 

        console.log(currentTable);
    
        // Replace the table in currentTables with the updated table
        updatedCurrentTables[tableId] = currentTable;
      }
    
      return {...newState, currentTables: updatedCurrentTables}
    }
    


    case VIEW_TABLE:{
      console.log(action.payload);
      return {...newState, activeTable:action.payload, showGames: false, showTables: false, showActiveTable: true}
    }


    case JOIN_TABLE:{
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
      // Check if the active table exists in newCurrentTables
      if (newCurrentTables[tableId]) {
        console.log(newCurrentTables[tableId]);
        console.log(newCurrentTables[tableId].tableUsers);
        console.log(newCurrentTables[tableId].tableUsers[seat]);
        // Assign newTableUser to seat in tableUsers obj of the active table
        newCurrentTables[tableId].tableUsers[seat] = newTableUser;
        newCurrentTables[tableId].currentSeat = seat;
      }

      return { ...newState, currentTables: newCurrentTables };
    }




    // case LEAVE_SEAT:{
    //   console.log(action.payload);
    //   const {seat, tableId} = action.payload
    //   const newCurrentTables = { ...newState.currentTables };

    //   // Check if the active table exists in newCurrentTables
    //   if (newCurrentTables[tableId]) {
    //     // Remove the seat from the tableUsers object
    //     delete newCurrentTables[tableId].tableUsers[seat];
    //   }

    //   return { ...newState, currentTables: newCurrentTables };
    // }

    

    case FORFEIT_SEAT:{
      console.log(action.payload);
      const {seat, tableId} = action.payload
      const newCurrentTables = { ...newState.currentTables };

      // Check if the active table exists in newCurrentTables
      if (newCurrentTables[tableId]) {
        // Update the seat to forfeited
        newCurrentTables[tableId].tableUsers[seat].forfeit = true;
      }

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

      console.log(playerSeat);

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

    case PLAYER_RECONNECT: {
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
      console.log(seat);
      
      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };
      
      delete newCurrentTable.tableUsers[seat];
      newCurrentTables[tableId] = newCurrentTable;
      
      return { ...newState, currentTables: newCurrentTables };
    }



    case PLAYER_ADD_TABLE_FUNDS: {
      console.log(action.payload);
      const {seat, tableId, amount} = action.payload;
      
      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };
      
      const newCurrentSeat = newCurrentTable.tableUsers[seat];
      console.log(newCurrentTable.tableUsers);

      console.log(newCurrentSeat);
      newCurrentSeat.tableBalance += amount;
      
      return { ...newState, currentTables: newCurrentTables };
    }

    case UPDATE_TABLE_COUNTDOWN: {
      console.log(action.payload);
      console.log('here');

      const {countdownRemaining, tableId} = action.payload;
      
      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };


      newCurrentTable.countdown = countdownRemaining
      newCurrentTables[tableId] = newCurrentTable;

      console.log(newCurrentTable);
      

      
      return { ...newState, currentTables: newCurrentTables };
    }

    case COLLECT_BETS: {
      console.log(action.payload);
      console.log('here');

      const {countdownRemaining, tableId} = action.payload;
      
      const newCurrentTables = { ...newState.currentTables };
      const newCurrentTable = { ...newCurrentTables[tableId] };


      newCurrentTable.countdown = countdownRemaining
      newCurrentTables[tableId] = newCurrentTable;

      console.log(newCurrentTable);
      

      
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