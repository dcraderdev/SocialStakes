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

const {gameController} = require('./gameController')



const botController = {
  
  async botInit() {

    // get bellagio table
    // clear any seat with currentMIT player
    // get MIT players
    // have them take seats at table

    let botIds = [    
      "e10d8de4-f4c8-4d28-9324-56aa9c924a83",
      "e10d8de4-f4c8-4d28-9324-56aa9c924a84",
      "e10d8de4-f4c8-4d28-9324-56aa9c924a85",
      "e10d8de4-f4c8-4d28-9324-56aa9c924a86",
      "e10d8de4-f4c8-4d28-9324-56aa9c924a87",
    ]

    const table = await Table.findOne({
      where: {
        tableName: 'Bellagio'
      },
      include: [
        {
          model: Game,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'rake']
          },

        },
        {
          model: GameSession,
          as: 'gameSessions',
          attributes: ['id','nonce','blockHash'],
        },
        {
          model: Conversation,
          attributes: ['id', 'chatName'],
        },


      ],
      attributes: ['id','private', 'shufflePoint', 'tableName', 'userId'],
    });

    if (!table) {
      return false;
    }

    
    botIds.forEach( async (userId, index) => {
      
      let tableId = table.id
      let seat = index + 1
      let amount = 50000
      let user = {
        id: userId
      }


      await gameController.removeUserFromTables(userId)
      await gameController.takeSeat(tableId, seat, user, amount)
    });







  }









}

module.exports = {botController};



// class BotController {
//   constructor(botSocket) {
//       this.botSocket = botSocket;
//       this.currentGameState = null;
//   }

//   listenToGameEvents() {
//       this.botSocket.on('gameUpdate', (gameState) => {
//           this.currentGameState = gameState;
//           this.decideNextAction();
//       });
//   }

//   decideNextAction() {
//       // Decision logic here. For simplicity, let's say the bot hits if below 17 and stands otherwise.
//       if (this.currentGameState.botHandValue < 17) {
//           this.botSocket.emit('hit');
//       } else {
//           this.botSocket.emit('stand');
//       }
//   }

//   adjustStrategy() {
//       // If you want to implement dynamic strategy adjustments, do it here.
//   }


//   listenToGameOutcomes() {
//     this.botSocket.on('gameOutcome', (result) => {
//         if (result === 'lose') {
//             this.lossStreak++;
//             this.adjustStrategy();
//         } else {
//             this.lossStreak = 0; // Reset the loss streak if the bot wins
//         }
//     });
//   }



//   adjustStrategy() {
//     if (this.lossStreak > 3) {
//         // Change strategy if the bot has lost 3 or more games consecutively.
//         // Example: Increase aggressiveness, change betting pattern, etc.
//     }
//   }







