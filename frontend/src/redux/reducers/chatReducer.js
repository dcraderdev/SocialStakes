
import { 
  ADD_MESSAGE, EDIT_MESSAGE, DELETE_MESSAGE, GET_USER_CONVERSATIONS

} from '../actions/actionTypes'



const initialState = {
  conversations: {},
  chatRoom: null,
  chatRoomTabs: [],
  generalChat: null,
  conversationInvites: [],
  friends: []
}

const gamesReducer = (state = initialState, action) => {
  const newState = { ...state };

  switch (action.type) {

    case ADD_MESSAGE: {
      const { tableId, user, message } = action.payload;

      const newConversations = { ...newState.conversations };

      if (!newConversations[tableId]) {
        newConversations[tableId] = {}
        newConversations[tableId].messages = []
      }
    
      if (newConversations[tableId]) {
        const newMessage = { user, message };
        newConversations[tableId].messages.push(newMessage);
      }

    
      return { ...newState, conversations: newConversations };
    }

    case EDIT_MESSAGE: {
      const {tableId, userId,  messageId, newContent } = action.payload;

      const newConversations = { ...newState.conversations };

      if (!newConversations[tableId]) {
        newConversations[tableId] = {}
        newConversations[tableId].messages = []
      }
    
      if (newConversations[tableId]) {
        // Find the index of the message to be edited
        const messageIndex = newConversations[tableId].messages.findIndex(message => message.message.id === messageId);
    
        // If the message is found, update its content
        if (messageIndex > -1) {
          newConversations[tableId].messages[messageIndex].message.content = newContent;
        }
      }

    
      return { ...newState, conversations: newConversations };
    }

    case DELETE_MESSAGE: {
      const {tableId, userId, messageId } = action.payload;
    
      const newConversations = { ...newState.conversations };
    
      if (!newConversations[tableId]) {
        newConversations[tableId] = {}
        newConversations[tableId].messages = []
      }
    
      const { messages } = newConversations[tableId];
      
      if (messages) {
        const messageIndex = messages.findIndex(message => message.message.id === messageId);
    
        if (messageIndex > -1) {
          newConversations[tableId].messages = [
            ...messages.slice(0, messageIndex),
            ...messages.slice(messageIndex + 1)
          ];
        }
      }

      
      
      return { ...newState, conversations: newConversations };
    }
    
    
    
    
    case GET_USER_CONVERSATIONS: {
      let newConversations = action.payload
      console.log(action.payload);
      return {...newState, conversations: newConversations}
    }












    
  

    default:
      return newState;
  }
};

export default gamesReducer;