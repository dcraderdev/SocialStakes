import { setUser, removeUser, setThemes, getUserStatsAction } from '../actions/userActions'
import { showGamesAction } from '../actions/gameActions'
import { csrfFetch } from './csrf';



// ****************

export const login = (user) => async (dispatch) => {
  const { credential, password } = user;
  const response = await csrfFetch('/api/session', {
    method: 'POST',
    body: JSON.stringify({
      credential,
      password,
    }),
  });
  const data = await response.json();

  dispatch(setUser(data));
  return {data, response};
};



export const signup = (user) => async (dispatch) => {
  const { username, firstName, lastName, email, password } = user;
  const response = await csrfFetch("/api/users", {
    method: "POST",
    body: JSON.stringify({
      username,
      firstName,
      lastName,
      email,
      password,
    }),
  });


  const data = await response.json();
  dispatch(setUser(data)); 
  return {data, response};
};


export const logout = () => async (dispatch) => {
  const response = await csrfFetch('/api/session', {
    method: 'DELETE',
  });
  dispatch(removeUser());
  dispatch(showGamesAction());
  return response;
};


export const restoreUser = () => async (dispatch) => {
  const response = await csrfFetch("/api/session");
  const data = await response.json();

  if (data.user) {
    dispatch(setUser(data.user));
  }
  return response;
};

export const loadThemes = () => async (dispatch) => {

  try{
    const response = await csrfFetch("/api/session/themes");
    const data = await response.json();

    dispatch(setThemes(data));
    return response;
    
  }catch(error){
    console.log(error);
  }

};


export const getUserStats = () => async (dispatch) => {
  
  try{
    const response = await csrfFetch(`/api/session/stats`);
    const data = await response.json();

    // console.log('-=-=-=-=');
    // console.log(data); 
    // console.log('-=-=-=-=');
  
    dispatch(getUserStatsAction(data));
    return response;
    
  }catch(error){
    console.log(error);
  }

};