const { rooms, roomInit } = require('../global');
const { gameController } = require('../controllers/gameController');

async function fetchUpdatedTable(tableId) {
  let updatedTable = await gameController.getTableById(tableId);
  if (!updatedTable) return;

  if (!rooms[tableId]) {
    rooms[tableId] = roomInit();
    rooms[tableId].id = updatedTable.tableId;
    rooms[tableId].gameSessionId = updatedTable.gameSessions[0].id;
    rooms[tableId].blockHash = updatedTable.gameSessions[0].blockHash;
    rooms[tableId].decksUsed = updatedTable.Game.decksUsed;
    rooms[tableId].shufflePoint = updatedTable.shufflePoint;
    rooms[tableId].conversationId = updatedTable.Conversation.id;
    rooms[tableId].chatName = updatedTable.Conversation.chatName;
    rooms[tableId].gameType = updatedTable.Game.shortName;
    rooms[tableId].Game = updatedTable.Game;
  }

  return updatedTable;
}
module.exports = fetchUpdatedTable;