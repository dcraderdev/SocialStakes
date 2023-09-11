const {
  rooms
} = require('../global');

function emitUpdatedTable(io, tableId) {


  if (!rooms[tableId]) return;
  let room = tableId;
  let updateObj = {
    tableId,
    table: {
      seats: rooms[tableId].seats,
      dealerCards: {
        visibleCards: rooms[tableId].dealerCards.visibleCards,
      },

      actionSeat: rooms[tableId].actionSeat,
      actionEndTimeStamp: rooms[tableId].actionEndTimeStamp,
      dealCardsTimeStamp: rooms[tableId].dealCardsTimeStamp,
      handInProgress: rooms[tableId].handInProgress,
      conversationId: rooms[tableId].conversationId,
      chatName: rooms[tableId].chatName,
      gameSessionId: rooms[tableId].gameSessionId,
    },
  };

  io.in(room).emit('get_updated_table', updateObj);
}


module.exports = emitUpdatedTable;