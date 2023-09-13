
import {
  ADD_MESSAGE, EDIT_MESSAGE, DELETE_MESSAGE, 
  ADD_PAYOUT_MESSAGE,
  GET_USER_CONVERSATIONS, 
  SHOW_CONVERSATION_BY_ID, 
  ADD_CONVERSATION, REMOVE_CONVERSATION,
  CHANGE_CHAT_NAME,
  REMOVE_USER_FROM_CONVERSATION,
  ADD_USER_TO_CONVERSATION
} from './actionTypes'




export const addMessageAction = (messageObj) => {
  return {
    type: ADD_MESSAGE,
    payload: messageObj
  };
};
export const addPayoutMessageAction = (payout) => {
  return {
    type: ADD_PAYOUT_MESSAGE,
    payload: payout
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
  return {
    type: GET_USER_CONVERSATIONS,
    payload: data
  };
};


export const showConversationAction = (conversation) => {
  return {
    type: SHOW_CONVERSATION_BY_ID,
    payload: conversation,

  };
};



export const addConversationAction = (convoObj) => {
  return {
    type: ADD_CONVERSATION,
    payload: convoObj,
  };
};


export const removeConversationAction = (convoObj) => {
  return {
    type: REMOVE_CONVERSATION,
    payload: convoObj,

  };
};

export const changeChatNameAction = (changeObj) => {
  return {
    type: CHANGE_CHAT_NAME,
    payload: changeObj,

  };
};




export const removeUserFromConversationAction = (leaveObj) => {
  return {
    type: REMOVE_USER_FROM_CONVERSATION,
    payload: leaveObj,
  };
};

export const addUserToConversationAction = (convoObj) => {
  return {
    type: ADD_USER_TO_CONVERSATION,
    payload: convoObj,
  };
};