
import { SET_USER, REMOVE_USER, SET_THEMES, CHANGE_NEON_THEME, CHANGE_TABLE_THEME } from '../actions/actionTypes'

const initialState = {
  user: null,
  isAuthenticated: false,
  friends: {},
  themes: {},
  neonTheme: null,
  tableTheme: null
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

    case SET_THEMES:{
      const themes = action.payload.reduce((acc, theme)=>{
        acc[theme.name] = theme
        return acc
      },{})

      return {
        ...newState,
        themes: themes,
      };   
    }
    case CHANGE_TABLE_THEME:{
      return {
        ...newState,
        tableTheme: action.payload,
      };   
    } 
    case CHANGE_NEON_THEME:{
      return {
        ...newState,
        neonTheme: action.payload,
      };   
    } 



    default:
      return newState;


    }
};

export default userReducer;