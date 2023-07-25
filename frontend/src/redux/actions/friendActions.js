import {
  ADD_INCOMING_FRIEND_REQUEST, 
  ADD_OUTGOING_FRIEND_REQUEST, 
  ACCEPT_FRIEND_REQUEST, 
  DENY_FRIEND_REQUEST,
  GET_USER_FRIENDS,
  SHOW_FRIEND_INVITES,
  SHOW_TABLE_INVITES,
  SHOW_FRIENDS,
  REMOVE_FRIEND
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

export const removeFriendAction = (friendObj) => {
  console.log(friendObj);
  return {
    type: REMOVE_FRIEND,
    payload: friendObj,

  };
};




// actions for page display
export const showFriendInvitesAction = () => {
  return {
    type: SHOW_FRIEND_INVITES,
  };
};


export const showTableInvitesAction = () => {
  return {
    type: SHOW_TABLE_INVITES,
  };
};

export const showFriendsAction = (friend) => {
  console.log(friend);
  return {
    type: SHOW_FRIENDS,
    payload: friend,

  };
};