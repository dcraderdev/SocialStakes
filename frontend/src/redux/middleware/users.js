import { setUser, removeUser, setThemes } from '../actions/userActions'
import { csrfFetch } from './csrf';



// ****************

export const login = (user) => async (dispatch) => {
console.log('loggin in');
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
  console.log('here'); 
  const { username, firstName, lastName, email, password } = user;
  console.log(username, firstName, lastName, email, password);
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

    console.log('-=-=-=-=');
    console.log(data); 
    console.log('-=-=-=-=');
  
    dispatch(setThemes(data));
    return response;
    
  }catch(error){
    console.log(error);
  }

};