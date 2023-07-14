
import {
  ADD_MESSAGE, EDIT_MESSAGE, REMOVE_MESSAGE_ADMIN, REMOVE_MESSAGE_USER
} from './actionTypes'


export const removeMessage_user = (message) => {
  console.log('here');
  console.log(message);
  return {
    type: REMOVE_MESSAGE_USER,
    payload: message,
  };
};