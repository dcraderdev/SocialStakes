const { rooms, lastPayouts } = require('../global');


async function emitMainPageWinnerMessage(
  io,
  tableId,
  player,
  handData,
  totalWinnings
) {
  // Broadcast message to specific room

  let room = 'payoutMessages';

  // if (!newMessage) console.log('no message');;

  newMessageObj = {
    createdAt: Date.now(),
    gameType: rooms[tableId].gameType,
    username: player.username,
    bet: handData.bet,
    payout: totalWinnings,
  };


  if (lastPayouts.length >= 10) {
    lastPayouts.shift();
    lastPayouts.push(newMessageObj);
  } else {
    lastPayouts.push(newMessageObj);
  }


  io.in(room).emit('new_payout', newMessageObj);
}

module.exports = emitMainPageWinnerMessage;
