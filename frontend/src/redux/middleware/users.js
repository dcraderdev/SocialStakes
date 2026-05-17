import { setUser, removeUser, setThemes } from '../actions/userActions'
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
  // Auto-spin up a fresh guest session so the UI is never user-less
  await dispatch(initSession());
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

// Auto-creates a guest session if no valid auth cookie exists.
// Guarantees every visitor has a user identity with $1000 chips.
export const initSession = () => async (dispatch) => {
  const response = await csrfFetch('/api/init');
  const data = await response.json();
  if (data && data.id) {
    dispatch(setUser(data));
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

// Demo refill — gives the current user another $1000 in chips.
export const refillBalance = () => async (dispatch, getState) => {
  const response = await csrfFetch('/api/users/refill', { method: 'POST' });
  if (!response.ok) return response;
  const data = await response.json();
  const currentUser = getState().users.user;
  if (currentUser) {
    dispatch(setUser({ ...currentUser, balance: data.balance }));
  }
  return response;
};


