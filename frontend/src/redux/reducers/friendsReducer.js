import {
  ADD_INCOMING_FRIEND_REQUEST, 
  ADD_OUTGOING_FRIEND_REQUEST, 
  ACCEPT_FRIEND_REQUEST, 
  DENY_FRIEND_REQUEST,
  GET_USER_FRIENDS,
  SHOW_TABLE_INVITES, SHOW_FRIEND_INVITES, SHOW_FRIENDS
} from '../actions/actionTypes'

const initialState = {
    incomingRequests: {}, 
    outgoingRequests: {}, 
    friends: {},
    showFriendInvites: false,
    showTableInvites: false,
    showFriends: false,
    currentFriendView: null,

};

const userReducer = (state = initialState, action) => {
  const newState = { ...state };
  console.log('-=-=-=-=-=');
  console.log('-=-=-=-=-=');
  console.log(newState);
  console.log('-=-=-=-=-=');
  console.log('-=-=-=-=-=');


  switch (action.type) {

    case ADD_INCOMING_FRIEND_REQUEST: {
      const { newFriend, requestInfo} = action.payload;
    
      // add the new request
      newState.incomingRequests[newFriend.id] = action.payload;
    
      return {...newState};
    }

    case ADD_OUTGOING_FRIEND_REQUEST: {
      const { newFriend, requestInfo} = action.payload;
      
      // add the new request
      newState.outgoingRequests[newFriend.id] = action.payload;
      
      return {...newState};
    }
    

    case ACCEPT_FRIEND_REQUEST: {
      const { newFriend, requestInfo } = action.payload;
    
      // Remove from incomingRequests
      if (newState.incomingRequests[newFriend.id]) {
        delete newState.incomingRequests[newFriend.id];
      }
    
      // Remove from outgoingRequests
      if (newState.outgoingRequests[newFriend.id]) {
        delete newState.outgoingRequests[newFriend.id];
      }
    
      // Add to friends list
      newState.friends[newFriend.id] = action.payload;
    
      return {...newState};
    }
    
    
    case DENY_FRIEND_REQUEST: {
      const { newFriend, requestInfo } = action.payload;
    
      // Remove from incomingRequests
      if (newState.incomingRequests[newFriend.id]) {
        delete newState.incomingRequests[newFriend.id];
      }
    
      // Remove from outgoingRequests
      if (newState.outgoingRequests[newFriend.id]) {
        delete newState.outgoingRequests[newFriend.id];
      }
    
      return {...newState};
    }

    case GET_USER_FRIENDS: {

      console.log(action.payload);

      return{ 
        ...newState,
        incomingRequests: action.payload.incomingRequests, 
        outgoingRequests: action.payload.incomingRequests, 
        friends: action.payload.friends
      }
    }
    case SHOW_FRIEND_INVITES: {
      return {
        ...newState,
        showTableInvites:false,
        showFriendInvites:true,
        showFriends: false,
        currentFriendView: null,

      }
      
    }

    case SHOW_TABLE_INVITES: {
      return {
        ...newState,
        showTableInvites:true,
        showFriendInvites:false,
        showFriends: false,
        currentFriendView: null,


      }
    }

    case SHOW_FRIENDS: {
      const friend = action.payload
      return {
        ...newState,
        showFriends:true,
        showTableInvites:false,
        showFriendInvites:false,
        currentFriendView: friend
      }
    }
    

    default:
      return newState;
  }
};

export default userReducer;