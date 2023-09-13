const { rooms } = require('../global');
const { chatController } = require('../controllers/chatController');

async function emitCustomMessage( io, messageObj) {
  // Broadcast message to specific room

  let roomUserId = 'e10d8de4-f4c7-0000-0000-000000000000';

  const { conversationId, content, tableId, cards } = messageObj;
  let room = conversationId;

  const newMessage = await chatController.createMessage(
    messageObj,
    roomUserId
  );

  // if (!newMessage) console.log('no message');;

  if (!newMessage) return false;

  newMessageObj = {
    createdAt: Date.now(),
    conversationId,
    content,
    cards,
    id: newMessage.id,
    userId: roomUserId,
    username: 'Room',
  };

  if (tableId) {
    newMessageObj.tableId = tableId;
    newMessageObj.chatName = rooms?.[tableId]?.chatName;
  }

  io.in(room).emit('new_message', newMessageObj);
}
module.exports = emitCustomMessage;