import { setCsrfTokenAction } from '../actions/csrfActions'
import Cookies from 'js-cookie';

export const setCsrfTokenThunk = () => async (dispatch, getState) => {
  try {
    const response = await fetch('http://localhost:8000/api/csrf/restore', {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    const csrfToken = data['XSRF-Token'];

    dispatch(setCsrfTokenAction(csrfToken));
  } catch (error) {
    // console.error(error);
  }
};
// frontend/src/store/csrf.js

export async function csrfFetch(url, options = {}) {
  // console.log(url);
  // console.log(options);

  // set options.method to 'GET' if there is no method
  options.method = options.method || 'GET';
  // set options.headers to an empty object if there is no headers
  options.headers = options.headers || {};

  // if the options.method is not 'GET', then set the "Content-Type" header to
    // "application/json", and set the "XSRF-TOKEN" header to the value of the 
    // "XSRF-TOKEN" cookie
  if (options.method.toUpperCase() !== 'GET') {
    if (!options.headers['Content-Type'] && !(options.body instanceof FormData)) {
      options.headers['Content-Type'] = 'application/json';
    }

    // options.headers['Content-Type'] =
    //   options.headers['Content-Type'] || 'application/json';
    options.headers['XSRF-Token'] = Cookies.get('XSRF-TOKEN');
  }
  // call the default window's fetch with the url and the options passed in
  


  const res = await window.fetch(url, options);

  // if the response status code is 400 or above, then throw an error with the
    // error being the response


    
  if (res.status >= 400) {
    const errorData = await res.json(); 
    const error = new Error('Request failed');
    error.status = res.status;
    error.data = errorData; 
    // console.log(error.status);
    // console.log(error.data);
    throw error;
  }
  // if the response status code is under 400, then return the response to the
    // next promise chain
  return res;
}




// call this to get the "XSRF-TOKEN" cookie, should only be used in development
export function restoreCSRF() {

  return csrfFetch('/api/csrf/restore');
}
// export default csrfFetch