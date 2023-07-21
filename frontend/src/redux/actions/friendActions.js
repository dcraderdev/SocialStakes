import {
  ADD_INCOMING_FRIEND_REQUEST, 
  ADD_OUTGOING_FRIEND_REQUEST, 
  ACCEPT_FRIEND_REQUEST, 
  DENY_FRIEND_REQUEST
} from '../actions/actionTypes'



export const addOutGoingFriendRequest = (friendRequestObj) => {
  
  console.log(friendRequestObj);
  
  return {
    type: ADD_OUTGOING_FRIEND_REQUEST,
    payload: friendRequestObj,
  };
};

export const addIncomingFriendRequest = (friendRequestObj) => {
  console.log(friendRequestObj);

  return {
    type: ADD_INCOMING_FRIEND_REQUEST,
    payload: friendRequestObj,
  };
};

export const acceptFriendRequest = (friendRequestObj) => {
  
  console.log(friendRequestObj);
  return {
    type: ACCEPT_FRIEND_REQUEST,
    payload: friendRequestObj,
  };
};

export const denyFriendRequest = (friendRequestObj) => {
  console.log(friendRequestObj);

  return {
    type: DENY_FRIEND_REQUEST,
    payload: friendRequestObj,
  };
};

