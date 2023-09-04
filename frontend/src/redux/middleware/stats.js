import { getUserStatsAction, getUserTablesAction } from '../actions/statActions'
import { csrfFetch } from './csrf';


export const getUserStats = () => async (dispatch) => {
  
  try{
    const response = await csrfFetch(`/api/session/stats`);
    const data = await response.json();

    // console.log('-=-=-=-=');
    // console.log(data); 
    // console.log('-=-=-=-=');
  
    dispatch(getUserStatsAction(data));
    return response;
    
  }catch(error){
    console.log(error);
  }

};


export const getUserTables = () => async (dispatch) => {
  
  try{
    const response = await csrfFetch(`/api/session/tables`);
    const data = await response.json();

    // console.log('-=-=-=-=');
    // console.log(data); 
    // console.log('-=-=-=-=');
  
    dispatch(getUserTablesAction(data));
    return response;
    
  }catch(error){
    console.log(error);
  }

};