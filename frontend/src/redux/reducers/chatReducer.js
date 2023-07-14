
import { 
  ADD_MESSAGE, EDIT_MESSAGE, DELETE_MESSAGE

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
      console.log('adding message');
      console.log(action.payload);
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

      console.log(newConversations);
    
      return { ...newState, conversations: newConversations };
    }

    case EDIT_MESSAGE: {
      console.log('editing message');
      console.log(action.payload);
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

      console.log(newConversations);
    
      return { ...newState, conversations: newConversations };
    }

    case DELETE_MESSAGE: {
      console.log('Deleting message');
      console.log(action.payload);
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
      
      console.log(newConversations);
    
      return { ...newState, conversations: newConversations };
    }
    
  

    default:
      return newState;
  }
};

export default gamesReducer;