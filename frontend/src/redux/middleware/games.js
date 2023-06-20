import { 
  getAllGamesAction, getGameByIdAction,
   getAllTablesAction, getTablesByTypeAction, getTableByIdAction, joinTableAction
  } 
  from '../actions/gameActions'
import { csrfFetch } from './csrf';



export const getAllGames = () => async (dispatch) => {
    const response = await csrfFetch('/api/games/all', {
      method: 'GET',
    });
    const data = await response.json();
  
    dispatch(getAllGamesAction(data));
    return {data, response};
  };
  
  export const getAllTables = () => async (dispatch) => {
    console.log('here before fail');
    try{
      const response = await csrfFetch(`/api/games/${gameId}/tables`, {
        method: 'GET',
      });
      const data = await response.json();
 
      console.log('-=-=-=-=');
      console.log(data); 
      console.log('-=-=-=-=');

      dispatch(getAllTablesAction(data));
      return {data, response};

    }catch(error){
      console.log(error);
    }
  };     

  export const getGameById = (gameId) => async (dispatch) => {
    try{
      const response = await csrfFetch(`/api/games/${gameId}`, {
        method: 'GET',
      });
      const data = await response.json();
 
      console.log('-=-=-=-=');
      console.log(data); 
      console.log('-=-=-=-=');

      dispatch(getAllGamesAction(data));
      return {data, response};

    }catch(error){
      console.log(error);
    }
  }

  export const getTablesByType = (gameId) => async (dispatch) => {
    console.log('here');
    console.log(gameId);
    try{
      const response = await csrfFetch(`/api/tables/game/${gameId}`, {
        method: 'GET',
      });
      const data = await response.json();
 
      console.log('-=-=-=-=');
      console.log(data); 
      console.log('-=-=-=-=');

      dispatch(getTablesByTypeAction(data));
      return {data, response};

    }catch(error){
      console.log(error);
    }
  };  

  
  export const getTableById = (tableId) => async (dispatch) => {

    try{
      const response = await csrfFetch(`/api/tables/${tableId}`, {
        method: 'GET',
      });
      const data = await response.json();
 
      console.log('-=-=-=-=');
      console.log(data); 
      console.log('-=-=-=-=');

      dispatch(getTableByIdAction(data));
      return {data, response};

    }catch(error){
      console.log(error);
    }
  };  



export const joinTable = (tableId, seat) => async (dispatch) => {

  try{
    const response = await csrfFetch(`/api/tables/${tableId}/join`, {
      method: 'POST',
      body: JSON.stringify({
        seat
      })
    });
    const data = await response.json();

    console.log('-=-=-=-=');
    console.log(data); 
    console.log('-=-=-=-=');

    dispatch(joinTableAction(data));
    return {data, response};

  }catch(error){
    console.log(error);
  }
};  