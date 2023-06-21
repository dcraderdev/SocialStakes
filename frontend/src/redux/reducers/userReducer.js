
import { SET_USER, REMOVE_USER, SET_THEMES } from '../actions/actionTypes'

const initialState = {
  user: null,
  isAuthenticated: false,
  friends: {},
  themes: {}
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

    case SET_THEMES:
      console.log(action.payload);
      const themes = action.payload.reduce((acc, theme)=>{
        acc[theme.name] = theme
        return acc
      },{})

      return {
        ...newState,
        themes: themes,
      };   
      
    default:
      return newState;


    }
};

export default userReducer;