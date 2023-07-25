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
      const { friend, requestInfo} = action.payload;
      let id = requestInfo.id

      console.log(action.payload);
      console.log(friend);
      console.log(requestInfo);
    
      // add the new request
      newState.incomingRequests[friend.id] = { id, friend };

      console.log(newState);
    
      return {...newState};
    }

    case ADD_OUTGOING_FRIEND_REQUEST: {
      const { friend, requestInfo} = action.payload;
      
      // add the new request
      newState.outgoingRequests[friend.id] = { id, friend };
      
      return {...newState};
    }
    

    case ACCEPT_FRIEND_REQUEST: {
      const { friend, requestInfo } = action.payload;
      let id = requestInfo.id

      console.log(action.payload);
      console.log(friend);
      console.log(requestInfo);
    
      console.log(newState);
      console.log(newState.incomingRequests);

      // Remove from incomingRequests
      if (newState.incomingRequests[friend.id]) {
        console.log('yes');
        console.log(newState.incomingRequests);
        console.log(newState.incomingRequests[friend.id]);

        delete newState.incomingRequests[friend.id];
      }
    
      // Remove from outgoingRequests
      if (newState.outgoingRequests[friend.id]) {
        delete newState.outgoingRequests[friend.id];
      }
    
      // Add to friends list
      newState.friends[friend.id] = { id, friend };;
    
      return {...newState};
    }
    
    
    case DENY_FRIEND_REQUEST: {
      const { friend, requestInfo } = action.payload;
    
      console.log(action.payload);
      console.log(friend);
      console.log(requestInfo);


      // Remove from incomingRequests
      if (newState.incomingRequests[friend.id]) {
        delete newState.incomingRequests[friend.id];
      }
    
      // Remove from outgoingRequests
      if (newState.outgoingRequests[friend.id]) {
        delete newState.outgoingRequests[friend.id];
      }
    
      return {...newState};
    }

    case GET_USER_FRIENDS: {

      console.log(action.payload);

      return{ 
        ...newState,
        incomingRequests: action.payload.incomingRequests, 
        outgoingRequests: action.payload.outgoingRequests, 
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