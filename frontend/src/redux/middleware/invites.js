import { csrfFetch } from './csrf';
import { setInviteCodeInfoAction } from '../actions/inviteActions';

export const sendInviteEmail = ({ recipientEmail, customMessage }) => async () => {
  const response = await csrfFetch('/api/invites', {
    method: 'POST',
    body: JSON.stringify({ recipientEmail, customMessage }),
  });
  const data = await response.json();
  return { data, response };
};

export const getInviteByCode = (code) => async (dispatch) => {
  const response = await csrfFetch(`/api/invites/code/${code}`);
  const data = await response.json();
  dispatch(setInviteCodeInfoAction(data));
  return { data, response };
};

export const redeemInviteCode = (code) => async () => {
  const response = await csrfFetch(`/api/invites/redeem/${code}`, {
    method: 'POST',
  });
  const data = await response.json();
  return { data, response };
};
