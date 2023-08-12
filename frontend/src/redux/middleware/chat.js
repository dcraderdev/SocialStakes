import { 
  getUserConversationsAction
  } 
  from '../actions/chatActions'


import { csrfFetch } from './csrf';


export const getUserConversations = () => async (dispatch) => {
  try{
    const response = await csrfFetch(`/api/session/conversations`, {
      method: 'GET'
    });

 
    const data = await response.json();

    dispatch(getUserConversationsAction(data)); 

    return {data, response};

  }catch(error){
    // console.log(error);
  } 
};  