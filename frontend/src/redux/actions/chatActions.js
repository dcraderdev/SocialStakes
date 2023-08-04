
import {
  ADD_MESSAGE, EDIT_MESSAGE, DELETE_MESSAGE, 
  GET_USER_CONVERSATIONS, 
  SHOW_CONVERSATION_BY_ID, 
  ADD_CONVERSATION, REMOVE_CONVERSATION,
  CHANGE_CHAT_NAME,
  ADD_CONVERSATION_INIVTE
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

export const addConversationInviteAction = (changeObj) => {
  console.log(changeObj);
  return {
    type: ADD_CONVERSATION_INIVTE,
    payload: changeObj,
  };
};


export const removeConversationInviteAction = (changeObj) => {
  console.log(changeObj);
  return {
    type: REMOVE_CONVERSATION_INVITE,
    payload: changeObj,
  };
};