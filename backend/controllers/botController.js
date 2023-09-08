const {
  User,
  Game,
  Table,
  UserTable,
  ServerSeed,
  Message,
  Round,
  Hand,
  GameSession,
  Conversation,
  UserConversation,
  Action,
  Friendship,
  Pot,
  UserPot,
} = require('../db/models');

const {
  roomInit,
  connections,
  rooms,
  disconnectTimeouts,
  disconnectTimes,
  lastPayouts
} = require('../global');


const {gameController} = require('./gameController')



const botController = {
  



  async handleBotInit () {
    let bots = [
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a83',
        username: 'Jeff Ma',
      },
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a84',
        username: 'John Chang',
      },
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a85',
        username: 'Bill Kaplan',
      },
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a86',
        username: 'Mike Aponte',
      },
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a87',
        username: 'Jane Willis',
      },
      {
        id: 'e10d8de4-f4c8-4d28-9324-56aa9c924a88',
        username: 'Seymon Dukach'
      }
    ];

    let bellagioTableId = 'be11a610-7777-7777-7777-7be11a610777';

    let updatedTable = await gameController.getTableById(bellagioTableId);
    if (!updatedTable) return;

    if (!rooms[bellagioTableId]) {
      rooms[bellagioTableId] = roomInit();
      rooms[bellagioTableId].gameSessionId = updatedTable.gameSessions[0].id;
      rooms[bellagioTableId].blockHash = updatedTable.gameSessions[0].blockHash;
      rooms[bellagioTableId].decksUsed = updatedTable.Game.decksUsed;
      rooms[bellagioTableId].shufflePoint = updatedTable.shufflePoint;
      rooms[bellagioTableId].conversationId = updatedTable.Conversation.id;
      rooms[bellagioTableId].chatName = updatedTable.Conversation.chatName;
      rooms[bellagioTableId].gameType = updatedTable.Game.shortName;
    } 

    bots.forEach(async (user, index) => {

      let tableId = bellagioTableId;
      let seat = index + 1;
      let amount = 50000;


      await gameController.removeUserFromTables(user.id);

      const takeSeat = await gameController.takeSeat(
        tableId,
        seat,
        user,
        amount
      );

      if (takeSeat) {
        const takeSeatObj = {
          id: takeSeat.id,
          seat: takeSeat.seat,
          tableBalance: takeSeat.tableBalance,
          tableId: takeSeat.tableId,
          userId: takeSeat.userId,
          disconnectTimer: takeSeat.disconnectTimer,
          pendingBet: takeSeat.pendingBet,
          currentBet: takeSeat.currentBet,
          username: user.username,
          forfeit: false,
          hands: {},
          cards: [],
          insurance: {
            accepted: false,
            bet: 0,
          },
        }; 

        rooms[tableId].seats[seat] = takeSeatObj;
      }
    });
  },






}

module.exports = {botController};



