import { ADD_TABLE_INVITE, DISMISS_TABLE_INVITE, SET_INVITE_CODE_INFO } from './actionTypes';

export const addTableInviteAction = (invite) => ({
  type: ADD_TABLE_INVITE,
  payload: invite,
});

export const dismissTableInviteAction = (senderId) => ({
  type: DISMISS_TABLE_INVITE,
  payload: senderId,
});

export const setInviteCodeInfoAction = (info) => ({
  type: SET_INVITE_CODE_INFO,
  payload: info,
});
