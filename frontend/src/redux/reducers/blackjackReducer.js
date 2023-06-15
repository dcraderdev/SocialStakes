
const initialState = {}

const blackjackReducer = (state = initialState, action) => {
  const newState = { ...state };

  switch (action.type) {

    default:
      return newState;
  }
};

export default blackjackReducer;