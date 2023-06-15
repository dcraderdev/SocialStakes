import {SET_CSRF_TOKEN} from './actionTypes'

export const setCsrfTokenAction = (token) => ({
  type: SET_CSRF_TOKEN,
  token,
});