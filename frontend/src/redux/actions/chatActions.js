
import {
  ADD_MESSAGE, EDIT_MESSAGE, DELETE_MESSAGE, GET_USER_CONVERSATIONS, SHOW_CONVERSATION_BY_ID
} from './actionTypes'




export const addMessageAction = (messageObj) => {
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


export const showConversationAction = (friend) => {
  console.log(friend);
  return {
    type: SHOW_CONVERSATION_BY_ID,
    payload: friend,

  };
};