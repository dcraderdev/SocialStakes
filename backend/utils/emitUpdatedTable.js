const {
  rooms
} = require('../global');

function emitUpdatedTable(io, tableId) {

  // conversationId 9e4384d0-83f1-4a02-8e29-016736c97211
  // tableId e10d8de4-f4c2-4d28-9324-56aa9c920801

console.log(rooms[tableId]);

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
      actionEnd: rooms[tableId].actionEnd,
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