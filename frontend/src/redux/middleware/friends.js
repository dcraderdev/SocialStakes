import {
  addOutGoingFriendRequest,
  addIncomingFriendRequest,
  acceptFriendRequest,
  denyFriendRequest,
  getUserFriendsAction,
  getUserFriendsWithStatusAction,
} from '../actions/friendActions'

import { csrfFetch } from './csrf';


export const getUserFriends = () => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/session/friends`, { method: 'GET' });
    const data = await response.json();
    dispatch(getUserFriendsAction(data));
    return { data, response };
  } catch (error) {
    console.log(error);
  }
};

// GET /api/friends/me — includes isOnline + currentTable
export const getFriendsWithStatus = () => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/friends/me`, { method: 'GET' });
    const data = await response.json();
    dispatch(getUserFriendsWithStatusAction(data));
    return { data, response };
  } catch (error) {
    console.log(error);
  }
};

// GET /api/friends/me/online
export const getOnlineFriends = () => async () => {
  try {
    const response = await csrfFetch(`/api/friends/me/online`, { method: 'GET' });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

// POST /api/friends/add — by username or email
export const addFriendByUsername = (username) => async (dispatch) => {
  const response = await csrfFetch(`/api/friends/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  const data = await response.json();
  if (!response.ok) {
    return { error: data.message || 'Failed to send friend request' };
  }
  // If pending, add to outgoing requests in Redux
  if (data.friendship && data.friendship.status === 'pending') {
    dispatch(addOutGoingFriendRequest({
      friend: data.recipient,
      requestInfo: data.friendship,
    }));
  }
  return { data };
};

// DELETE /api/friends/:id — remove by friendship ID
export const removeFriendRest = (friendshipId, friendId) => async (dispatch) => {
  const response = await csrfFetch(`/api/friends/${friendshipId}`, { method: 'DELETE' });
  const data = await response.json();
  if (!response.ok) {
    return { error: data.message || 'Failed to remove friend' };
  }
  return { data };
};
