import { 
  getAllGamesAction, getGameByIdAction,
  getAllTablesAction, getTablesByTypeAction, getTableByIdAction,
  viewTableAction, leaveTableAction, 
  takeSeatAction, leaveSeatAction, changeSeatAction
  } 
  from '../actions/gameActions'
import { csrfFetch } from './csrf';

import { SocketInstance } from '../../context/SocketContext';



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

  export const viewTable = (tableId) => async (dispatch) => {
    console.log('view table');
    try{
      const response = await csrfFetch(`/api/tables/${tableId}`, {
        method: 'GET'
      });
 

      const data = await response.json();
  
      console.log('-=-=-=-=');
      console.log(data); 
      console.log('-=-=-=-=');
   
      dispatch(viewTableAction(data));
      return {data, response};
  
    }catch(error){
      console.log(error);
    } 
  };


  export const leaveTable = (tableId) => async (dispatch) => {
    console.log('leaving');
    dispatch(leaveTableAction(tableId));
  };



export const takeSeat = (tableId, seat) => async (dispatch) => {
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
 
    dispatch(takeSeatAction(data));
    return {data, response};

  }catch(error){
    console.log(error);
  } 
};


export const changeSeat = (tableId, seat) => async (dispatch) => {
  try{
    const response = await csrfFetch(`/api/tables/${tableId}/seat`, {
      method: 'PUT',
      body: JSON.stringify({
        seat
      })
    });
    const data = await response.json();

    console.log('-=-=-=-=');
    console.log(data); 
    console.log('-=-=-=-=');

    dispatch(changeSeatAction(data));
    return {data, response};

  }catch(error){
    console.log(error);
  }
}; 


export const leaveSeat = (tableId, seat) => async (dispatch) => {

  try{
    const response = await csrfFetch(`/api/tables/${tableId}/leave`, {
      method: 'DELETE',
    });
    const data = await response.json();

    console.log('-=-=-=-=');
    console.log(data); 
    console.log('-=-=-=-='); 
    if(data){
      dispatch(leaveSeatAction(tableId, seat));
    }
    return {data, response};

  }catch(error){
    console.log(error);
  } 
}; 