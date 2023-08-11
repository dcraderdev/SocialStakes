import {
  ADD_INCOMING_FRIEND_REQUEST, 
  ADD_OUTGOING_FRIEND_REQUEST, 
  ACCEPT_FRIEND_REQUEST, 
  DENY_FRIEND_REQUEST,
  GET_USER_FRIENDS,
  SHOW_TABLE_INVITES, SHOW_FRIEND_INVITES, SHOW_FRIENDS, REMOVE_FRIEND, 
  SHOW_CONVERSATION_BY_ID, REMOVE_CONVERSATION
} from '../actions/actionTypes'






const initialState = {
    incomingRequests: {}, 
    outgoingRequests: {}, 
    rejectedRequests: {}, 
    friends: {},
    showFriendInvites: false,
    showTableInvites: false,
    showFriends: false,
    currentFriendView: null,
    showConversation: false,


};

const userReducer = (state = initialState, action) => {
  const newState = { ...state };

  switch (action.type) {

    case ADD_INCOMING_FRIEND_REQUEST: {
      const { friend, requestInfo} = action.payload;
      let id = requestInfo.id
  
      // add the new request
      newState.incomingRequests[friend.id] = { id, friend };
    
      return {...newState};
    }

    case ADD_OUTGOING_FRIEND_REQUEST: {
      const { friend, requestInfo} = action.payload;
      let id = requestInfo.id
      
      // add the new request
      newState.outgoingRequests[friend.id] = { id, friend };
      
      return {...newState};
    }
    

    case ACCEPT_FRIEND_REQUEST: {
      const { friend, requestInfo, conversationId } = action.payload;
      let id = requestInfo.id
      let status = requestInfo.status

      // Remove from incomingRequests
      if (newState.incomingRequests[friend.id]) {
        delete newState.incomingRequests[friend.id];
      }
    
      // Remove from outgoingRequests
      if (newState.outgoingRequests[friend.id]) {
        delete newState.outgoingRequests[friend.id];
      }
    
      // Add to friends list
      newState.friends[friend.id] = { id, friend, status, conversationId };;
    
      return {...newState};
    }
    
    
    case DENY_FRIEND_REQUEST: {
      const { friend, requestInfo } = action.payload;

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

    case REMOVE_FRIEND: {
      let friendId = action.payload.friendId

      if(newState.friends[friendId]){
        delete newState.friends[friendId]
      }

      let otherFriends = Object.values(newState.friends)
      if(otherFriends.length){
        newState.currentFriendView = otherFriends[0]
      } else{
        newState.currentFriendView = null
      }
      return{ 
        ...newState,
      }
    }



    case GET_USER_FRIENDS: {
      return{ 
        ...newState,
        incomingRequests: action.payload.incomingRequests, 
        outgoingRequests: action.payload.outgoingRequests, 
        rejectedRequests: action.payload.rejectedRequests, 
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
        showConversation: false,

      }
      
    }

    case SHOW_TABLE_INVITES: {
      return {
        ...newState,
        showTableInvites:true,
        showFriendInvites:false,
        showFriends: false,
        currentFriendView: null,
        showConversation: false,


      }
    }

    case SHOW_FRIENDS: {
      const friend = action.payload
      return {
        ...newState,
        showFriends:true,
        showTableInvites:false,
        showFriendInvites:false,
        currentFriendView: friend,
        showConversation: false,
      }
    }


    case SHOW_CONVERSATION_BY_ID: {
      const conversation = action.payload
      return {
        ...newState,
        showConversation: true,
        showFriends:false,
        showTableInvites:false,
        showFriendInvites:false,
        currentFriendView: null
      }
    }
    

    default:
      return newState;
  }
};

export default userReducer;