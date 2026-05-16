import { ADD_TABLE_INVITE, DISMISS_TABLE_INVITE, SET_INVITE_CODE_INFO } from '../actions/actionTypes';

const initialState = {
  tableInvites: {},
  inviteCodeInfo: null,
};

const inviteReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TABLE_INVITE: {
      const invite = action.payload;
      return {
        ...state,
        tableInvites: {
          ...state.tableInvites,
          [invite.senderId]: invite,
        },
      };
    }

    case DISMISS_TABLE_INVITE: {
      const next = { ...state.tableInvites };
      delete next[action.payload];
      return { ...state, tableInvites: next };
    }

    case SET_INVITE_CODE_INFO:
      return { ...state, inviteCodeInfo: action.payload };

    default:
      return state;
  }
};

export default inviteReducer;
