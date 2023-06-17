import { REMOVE_USER, SET_USER, ADD_MESSAGE, SET_CHAT_ROOM } from './actionTypes'



export const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user,
  };
};

export const removeUser = () => {
  return {
    type: REMOVE_USER,
  };
};


export const setChatRoom = (chatRoom) => {
  console.log('setting chat room');
  console.log(chatRoom);
  return {
    type: SET_CHAT_ROOM,
    payload: chatRoom
  };
};
 

export const addMessage = (message) => {
  console.log(message);
  return {
    type: ADD_MESSAGE,
    payload: message,
  };
};


