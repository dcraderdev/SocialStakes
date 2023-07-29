
import {
  ADD_MESSAGE, EDIT_MESSAGE, DELETE_MESSAGE, GET_USER_CONVERSATIONS, SHOW_CONVERSATION_BY_ID
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