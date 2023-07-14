
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
      const { tableId, content, user, messageId } = action.payload;

      const newConversations = { ...newState.conversations };
    
      if (newConversations[tableId]) {
        const newMessage = { content, user: {username: user.username, id: user.id}, id:messageId };
        newConversations[room].messages.push(newMessage);
      }

      console.log(newConversations);
    
      return { ...newState, conversations: newConversations };
    }
  

    default:
      return newState;
  }
};

export default gamesReducer;