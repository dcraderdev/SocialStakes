
import { 
  ADD_MESSAGE, EDIT_MESSAGE, DELETE_MESSAGE, GET_USER_CONVERSATIONS, SHOW_CONVERSATION_BY_ID, SHOW_FRIENDS, ADD_CONVERSATION, REMOVE_CONVERSATION,
   REMOVE_FRIEND, 
   CHANGE_CHAT_NAME, 
   REMOVE_USER_FROM_CONVERSATION,
   ADD_USER_TO_CONVERSATION

} from '../actions/actionTypes'



const initialState = {
  conversations: {},
  currentConversation: null,
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
      const { id, conversationId, userId, username, content } = action.payload;


      console.log({ id, conversationId, userId, username, content });

      const newConversations = { ...newState.conversations };

      if (!newConversations[conversationId]) {
        newConversations[conversationId] = {}
        newConversations[conversationId].messages = []
      }
    
      if (newConversations[conversationId]) {
        const newMessage = action.payload;
        newConversations[conversationId].messages.push(newMessage);
      }

    
      return { ...newState, conversations: newConversations };
    }

    case EDIT_MESSAGE: {
      const {conversationId, userId,  messageId, newContent } = action.payload;

      const newConversations = { ...newState.conversations };

      if (!newConversations[conversationId]) {
        newConversations[conversationId] = {}
        newConversations[conversationId].messages = []
      }
    
      if (newConversations[conversationId]) {
        // Find the index of the message to be edited
        const messageIndex = newConversations[conversationId].messages.findIndex(message => message.id === messageId);
    
        // If the message is found, update its content
        if (messageIndex > -1) {
          newConversations[conversationId].messages[messageIndex].content = newContent;
        }
      }

    
      return { ...newState, conversations: newConversations };
    }

    case DELETE_MESSAGE: {
      const {conversationId, userId, messageId } = action.payload;
      const newConversations = { ...newState.conversations };
    
      if (!newConversations[conversationId]) {
        newConversations[conversationId] = {}
        newConversations[conversationId].messages = []
      }
    
      const { messages } = newConversations[conversationId];
      
      if (messages) {
        const messageIndex = messages.findIndex(message => message.id === messageId);
    
        if (messageIndex > -1) {
          newConversations[conversationId].messages = [
            ...messages.slice(0, messageIndex),
            ...messages.slice(messageIndex + 1)
          ];
        }
      }

      return { ...newState, conversations: newConversations };
    }
    
    
    
    
    case GET_USER_CONVERSATIONS: {
      let newConversations = action.payload
      return {...newState, conversations: newConversations}
    }



    case ADD_CONVERSATION: {
      let {conversationId} = action.payload

      let newConversations = {...newState.conversations}
      newConversations[conversationId] = action.payload

      return {...newState, conversations: newConversations}

    }


    case REMOVE_CONVERSATION: {
      let {conversationId} = action.payload
    
      let newConversations = {...newState.conversations}
      delete newConversations[conversationId]
    
      let firstConversationId = Object.keys(newConversations)[0];
    
      if (!firstConversationId) {
        firstConversationId = null;
      }
    
      return {...newState, conversations: newConversations, currentConversation: firstConversationId}
    }

    case REMOVE_USER_FROM_CONVERSATION: {
      let {conversationId, userId} = action.payload
      let newConversations = {...newState.conversations}
      delete newConversations[conversationId].members[userId]
      return { ...newState, conversations: newConversations }
    }

    case ADD_USER_TO_CONVERSATION: {
      let {friendList, conversationId} = action.payload

      console.log(action.payload);

      let newConversations = {...newState.conversations}

      let newConversation = {...newState.conversations[conversationId]}


      console.log(newConversation);
      console.log(friendList);

      // newConversation.members = {...newConversation.members, ...friendList};

      Object.entries(friendList).forEach(([key, value]) => {
        newConversation.members[value.friend.id] = value.friend;
      })
      
      newConversations[conversationId] = newConversation;


      console.log(newConversation);

      return { ...newState, conversations: newConversations }
    }


    case SHOW_CONVERSATION_BY_ID: {
      let conversation = action.payload
      return {...newState, currentConversation: conversation.conversationId}
    }

    case SHOW_FRIENDS: {
      let conversation = action.payload
      return {...newState, currentConversation: conversation.conversationId}
    }

    
    case CHANGE_CHAT_NAME: {
      let {newChatName, conversationId} = action.payload
      let newConversations = {...newState.conversations}

      if(newConversations[conversationId]){
        console.log(newConversations[conversationId]);
        newConversations[conversationId].chatName = newChatName
      }

      return {...newState, conversations: newConversations}
    }

    





    
  

    default:
      return newState;
  }
};

export default gamesReducer;