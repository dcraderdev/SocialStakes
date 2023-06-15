
import { SET_USER, REMOVE_USER, ADD_MESSAGE } from '../actions/actionTypes'

const initialState = {
  user: null,
  isAuthenticated: false,
  chatRoom: null,
  conversationInvites: {},
  friends: {}
};

const userReducer = (state = initialState, action) => {
  const newState = { ...state };

  switch (action.type) {

    case SET_USER:
      return {
        ...newState,
        user: action.payload,
      };

    case REMOVE_USER:
      return initialState
      
    default:
      return newState;


    }
};

export default userReducer;