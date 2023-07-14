
import { 
  SET_USER, REMOVE_USER, 
  SET_THEMES, CHANGE_NEON_THEME, CHANGE_TABLE_THEME,
  LEAVE_SEAT, TAKE_SEAT, PLAYER_ADD_TABLE_FUNDS,
  REMOVE_PLAYER
} from '../actions/actionTypes'


const initialState = {
  user: null,
  balance: null,
  friends: {},
  themes: {},
  neonTheme: null,
  tableTheme: null
};

const userReducer = (state = initialState, action) => {
  const newState = { ...state };

  console.log(action);

  console.log(action.type);

  switch (action.type) {

    case SET_USER:
      console.log(action.payload);

      let newBalance = action.payload.balance
      return {
        ...newState,
        user: action.payload,
        balance: newBalance
      };

    case REMOVE_USER:
      return {...newState, user: null, balance:null , friends: {}}

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
      console.log(action.payload)
      return {
        ...newState,
        tableTheme: action.payload,
      };   
    } 


    case CHANGE_NEON_THEME:{
      console.log(action);
      console.log(action.payload) 
      return {
        ...newState,
        neonTheme: action.payload,
      };   
    } 


    case TAKE_SEAT: {
      console.log(action.payload);

      const {id, seat, tableBalance, tableId, userId, username } = action.payload

      // Update new user balance
      if (newState.user.id === userId) {
        let updatedBalance = newState.balance
        updatedBalance -= tableBalance

        return { ...newState, balance: updatedBalance };
      }

      return newState;
    }

    case LEAVE_SEAT: {
      console.log(action.payload);

      const { userId, tableBalance } = action.payload

      // Update new user balance
      if (newState.user.id === userId) {
        let updatedBalance = newState.balance
        updatedBalance += tableBalance

        return { ...newState, balance: updatedBalance };
      }

      return newState;
    }

    case PLAYER_ADD_TABLE_FUNDS: {
      console.log(action.payload);
    
      const {seat, tableId, amount, userId} = action.payload;
    
      // Update new user balance
      if (newState.user.id === userId) {
        let updatedBalance = newState.balance;
        updatedBalance -= amount;
    
        return { ...newState, balance: updatedBalance };
      }
    
      return newState;
    }

    case REMOVE_PLAYER: {
      console.log(action.payload);

      const {seat, tableId, userId, tableBalance } = action.payload

      // Update new user balance
      if (newState.user.id === userId) {
        let updatedBalance = newState.balance
        updatedBalance += tableBalance

        return { ...newState, balance: updatedBalance };
      }

      return newState;
    }




    



    default:
      return newState;


    }
};

export default userReducer;