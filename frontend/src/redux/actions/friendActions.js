import {
  ADD_INCOMING_FRIEND_REQUEST, 
  ADD_OUTGOING_FRIEND_REQUEST, 
  ACCEPT_FRIEND_REQUEST, 
  DENY_FRIEND_REQUEST,
  GET_USER_FRIENDS
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

export const getUserFriendsAction = (data) => {
  console.log(data);

  return {
    type: GET_USER_FRIENDS,
    payload: data,
  };
};
