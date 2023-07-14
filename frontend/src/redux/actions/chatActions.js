
import {
  ADD_MESSAGE, EDIT_MESSAGE, DELETE_MESSAGE
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


