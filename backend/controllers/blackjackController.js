const {
  Card,
  Deck,
  User,
  Friendship,
  UserFriendship,
  UserHand,
  Game,
  Table,
  UserGame,
  UserTable,
  DeckCard,
  Message,
  Conversation,
  UserConversation,
} = require('../db/models');

const { gameController } = require('./gameController');
const { chatController } = require('./chatController');
const { friendController } = require('./friendController');
const { cardConverter } = require('./cardConverter');
const { botController } = require('./botController');

const {
  roomInit,
  connections,
  rooms,
  disconnectTimeouts,
  disconnectTimes,
  lastPayouts,
} = require('../global');


let emitUpdatedTable = require('../utils/emitUpdatedTable') ;


let { countdownInterval } = require('../global');




const blackjackController = {

  isNoBetsLeft(tableId) {
    if (!rooms[tableId]) return true;
  
    // Iterate over all seats in the room to check for any remaining bets
    for (let seat in rooms[tableId].seats) {
      if (rooms[tableId].seats[seat].pendingBet > 0) {
        return false; // If there is a bet, return false
      }
    }
    // If no bets are found, return true
    return true;
  },
  


  stopCountdownToDeal(tableId, io) {
    let room = tableId;
    let countdownObj = { dealCardsTimeStamp: 0, tableId };
  
    console.log('_#_#_#_#_#_#_#_#_#_#_');
    console.log('_#_#_#_#_#_#_#_#_#_#_');
    console.log(rooms[tableId]);
    console.log(rooms[tableId].dealCardsTimeStamp);
    console.log('_#_#_#_#_#_#_#_#_#_#_');
    console.log('_#_#_#_#_#_#_#_#_#_#_');
  
    rooms[tableId].dealCardsTimeStamp = null;
    io.in(room).emit('countdown_update', countdownObj);
  },



  async handleLeaveBlackjackTable(socket, io, table, playerSeatObj){

    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');
    console.log('handleLeaveBlackjackTable');


    console.log(table);
    console.log(table.tableId);


      let player = playerSeatObj;
      let tableId = table.tableId;
      let seat = playerSeatObj.seat

      let userId = playerSeatObj.userId
      let userTableId = playerSeatObj.id

      console.log('*()*()*()*()*()*()*()*()*()*()*()*()*()');
      console.log('*()*()*()*()*()*()*()*()*()*()*()*()*()');
      console.log('playerSeatObj', playerSeatObj);
      console.log('*()*()*()*()*()*()*()*()*()*()*()*()*()');
      console.log('*()*()*()*()*()*()*()*()*()*()*()*()*()');





      let anyPlayersAfter = rooms[tableId].sortedActivePlayers.some(
        (sortedPlayer) => sortedPlayer.seat < seat
      );
      let anyPlayersBefore = rooms[tableId].sortedActivePlayers.some(
        (sortedPlayer) => sortedPlayer.seat > seat
      );
      let leaveOnPlayerTurn = rooms[tableId].actionSeat === seat;
      let handInProgress = rooms[tableId].handInProgress;

      let leaveSeatObj = {
        tableId,
        seat,
        userTableId,
        userId,
        tableBalance: player.tableBalance,
      };

      // If the user disconnects during a hand, add them to the forfeited players and update our hand's status
      if (handInProgress) {
        let playerHands = Object.entries(player.hands);
        for (let [key, handData] of playerHands) {
          handData.turnEnded = true;
        }
        rooms[tableId].forfeitedPlayers.push(player);
        player.forfeit = true;
        clearTimeout(disconnectTimeouts[userId]);
        delete disconnectTimeouts[userId];
        delete disconnectTimes[userId];

        let currentTimer = rooms[tableId].actionEnd;
        let leaveSeatObj = { tableId, seat, currentTimer };

        io.to(convoId).emit('player_forfeit', leaveSeatObj);

        //if no players left to act, end the round
        if (!anyPlayersBefore && !anyPlayersAfter) {
          await endRound(tableId, io);
          return;
        }

        if (leaveOnPlayerTurn) {
          clearInterval(rooms[tableId].timerId);
          await gameLoop(tableId, io);
          return;
        }
      } else {
        // Refund pending bet(if exists) for user
        player.tableBalance += rooms[tableId].seats[seat].pendingBet;
        rooms[tableId].seats[seat].pendingBet = 0;
        leaveSeatObj.tableBalance = player.tableBalance;

        // Remove the player from the room state
        if (rooms[tableId] && rooms[tableId].seats[seat]) {
          delete rooms[tableId].seats[seat];
        }

        const leaveSeat = await gameController.leaveSeat(leaveSeatObj);
        // const leaveSeat = await gameController.removeUserFromTables(userId)
        if (!leaveSeat) {
          console.log('!leaveSeat');
          console.log('!leaveSeat');
          console.log('!leaveSeat');
          console.log('!leaveSeat');
          console.log('!leaveSeat');
          console.log('!leaveSeat');
          return;
        }
        console.log('ye sleave seat');
        console.log('ye sleave seat');
        console.log('ye sleave seat');
        console.log('ye sleave seat');
        console.log('ye sleave seat');
        emitUpdatedTable(tableId, io);
        io.in(userId).emit('player_leave', leaveSeatObj);

        // if theres other bets continue timer, otherwise cancel
        if (this.isNoBetsLeft(tableId)) {
          this.stopCountdownToDeal(tableId, io);
        }
      }

      return 

  },




  





};

module.exports = {
  blackjackController,
};
