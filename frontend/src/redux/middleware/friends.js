import { 
  addOutGoingFriendRequest,
  addIncomingFriendRequest,
  acceptFriendRequest,
  denyFriendRequest,
  getUserFriendsAction
  } 
  from '../actions/friendActions'


import { csrfFetch } from './csrf';


export const getUserFriends = () => async (dispatch) => {
  try{
    const response = await csrfFetch(`/api/session/friends`, {
      method: 'GET'
    });

 
    const data = await response.json();

    console.log('-=-=-=-=');
    console.log(data); 
    console.log('-=-=-=-=');
 
    dispatch(getUserFriendsAction(data));

    return {data, response};

  }catch(error){
    console.log(error);
  } 
};  