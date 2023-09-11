const { rooms } = require('../global');


function setDealCardsTimeStamp(io, tableId) {
  console.log('setDealCardsTimeStamp');
  console.log('setDealCardsTimeStamp');
  console.log('setDealCardsTimeStamp');
  console.log('setDealCardsTimeStamp');
  if (!rooms[tableId]) return;
  if (rooms[tableId].dealCardsTimeStamp) return;

  let room = tableId;
  // Set countdown end time
  const countdownDuration = 3000; // 5 seconds
  const endTime = Math.ceil(Date.now() + countdownDuration);
  rooms[tableId].dealCardsTimeStamp = endTime;

  let countdownObj = {
    dealCardsTimeStamp: endTime,
    tableId,
  };

  io.in(room).emit('countdown_update', countdownObj);
}

module.exports = setDealCardsTimeStamp;
