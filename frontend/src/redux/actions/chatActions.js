
import {
  ADD_MESSAGE, EDIT_MESSAGE, DELETE_MESSAGE, 
  GET_USER_CONVERSATIONS, 
  SHOW_CONVERSATION_BY_ID, 
  ADD_CONVERSATION, REMOVE_CONVERSATION,
  CHANGE_CHAT_NAME,
  REMOVE_USER_FROM_CONVERSATION,
  ADD_USER_TO_CONVERSATION
} from './actionTypes'




export const addMessageAction = (messageObj) => {
  console.log(messageObj);
  return {
    type: ADD_MESSAGE,
    payload: messageObj
  };
};

export const editMessageAction = (messageObj) => {
  return {
    type: EDIT_MESSAGE,
    payload: messageObj
  };
};

export const deleteMessageAction = (messageObj) => {
  return {
    type: DELETE_MESSAGE,
    payload: messageObj
  };
};


export const getUserConversationsAction = (data) => {
  console.log(data);
  return {
    type: GET_USER_CONVERSATIONS,
    payload: data
  };
};


export const showConversationAction = (conversation) => {
  console.log(conversation);
  return {
    type: SHOW_CONVERSATION_BY_ID,
    payload: conversation,

  };
};



export const addConversationAction = (convoObj) => {
  console.log(convoObj);
  return {
    type: ADD_CONVERSATION,
    payload: convoObj,
  };
};


export const removeConversationAction = (convoObj) => {
  console.log(convoObj);
  return {
    type: REMOVE_CONVERSATION,
    payload: convoObj,

  };
};

export const changeChatNameAction = (changeObj) => {
  console.log(changeObj);
  return {
    type: CHANGE_CHAT_NAME,
    payload: changeObj,

  };
};




export const removeUserFromConversationAction = (leaveObj) => {
  console.log(leaveObj);
  return {
    type: REMOVE_USER_FROM_CONVERSATION,
    payload: leaveObj,
  };
};

export const addUserToConversationAction = (convoObj) => {
  console.log(convoObj);
  return {
    type: ADD_USER_TO_CONVERSATION,
    payload: convoObj,
  };
};