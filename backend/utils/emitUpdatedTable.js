const {
  rooms
} = require('../global');

function emitUpdatedTable(tableId, io) {
  console.log('emitUpdatedTable');
  console.log('emitUpdatedTable');
  console.log('emitUpdatedTable');
  console.log('emitUpdatedTable');
  console.log('emitUpdatedTable');
  console.log('emitUpdatedTable');

  if (!rooms[tableId]) return;
  let room = tableId;
  let updateObj = {
    tableId,
    table: {
      seats: rooms[tableId].seats,
      dealerCards: {
        visibleCards: rooms[tableId].dealerCards.visibleCards,
      },
    },
  };

  io.in(room).emit('get_updated_table', updateObj);
}


module.exports = emitUpdatedTable;