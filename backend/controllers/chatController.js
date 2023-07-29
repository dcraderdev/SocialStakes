const { Card, Deck, User, Friendship, UserFriendship, UserHand, Game, Table, UserGame, UserTable, DeckCard, Message, Conversation, UserConversation } = require('../db/models');
const { Op } = require('sequelize');
const Sequelize  = require('sequelize');
const userconversation = require('../db/models/userconversation');




const chatController = {



async createMessage(messageObj) {
  const {user,tableId, content} = messageObj
  let userId = user.id

  // console.log(user,tableId, content);

  const newMessage = await Message.create({
    userId, 
    tableId, 
    content, 
  });

  if(!newMessage){
    return false
  } 
  return newMessage
}, 


async editMessage(messageObj) {
  const {userId, messageId, newContent} = messageObj

  const newMessage = await Message.findByPk(messageId);

  if(!newMessage || newMessage.userId !== userId){
    return false
  } 

  newMessage.content = newContent
  await newMessage.save()
  return newMessage
}, 


async deleteMessage(messageObj) {
  const {userId, messageId} = messageObj

  const message = await Message.findByPk(messageId);

  if(!message || message.userId !== userId){
    return false
  } 

  await message.destroy();
  return true
}, 

// async sendMessage(messageObj) {

//   let userId = messageObj.sender.id
//   let conversation = await Conversation.findByPk(messageObj.conversationId,{
//     where: { isGeneral: true },
//     include: [
//       {
//         model: Message,
//         as: 'messages',
//         include: {
//           model: User,
//           as: 'sender',
//           attributes: ['id', 'username', 'userRoom'],
//         },
//       },
//       {
//         model: User,
//         as: 'users',
//         attributes: ['id', 'username'],
//         required: false
//       },
//     ]
//   });

//   if (!conversation) {
//     return {
//       message: 'No conversation found',
//       statusCode: 404
//     };
//   }

//   if (conversation) {
//     const newMessage = await Message.create({
//       senderId: messageObj.sender.id, 
//       conversationId: messageObj.conversationId, 
//       content: messageObj.content, 
//     });
//     if(newMessage){

//       let tabName = getTabName(conversation, userId)

//       const formattedConversation = {
//         tabName,
//         conversationId: conversation.id,
//         users: conversation.users.reduce((userAcc, user) => {
//           userAcc[user.username] = user;
//           return userAcc;
//         }, {}),
//         messages: [...conversation.messages, newMessage],
//         notification: false,
//       };
//       return formattedConversation

//     } else {
//       return {
//         message: 'Error creating message',
//         statusCode: 500
//       }
//     }
//   }

// }, 

  async getConversations(userId) {
    try {


      const userWithConversations = await User.findByPk(userId, {
        include: [{
          model: UserConversation,
          as: 'UserConversations',
          where: { hasLeft: false },
          include: [{
            model: Conversation,
            as: 'conversations',
            where: {
              tableId: null,
            },
            include: [
              {
                model: Message,
                as: 'messages',
                include: {
                  model: User,
                  attributes: ['id', 'username', 'rank'],
                },
              },
              {
                model: User,
                as: 'users',
                attributes: ['id', 'username', 'rank',],
              },
            ],
          }],
        }],
      });
      

      
      
      console.log('=-=-=-=-=');
      console.log('=-=-=-=-=');
      console.log('=-=-=-=-=');
      console.log('=-=-=-=-=');
      console.log(userWithConversations);
      console.log('=-=-=-=-=');
      console.log('=-=-=-=-=');
      console.log('=-=-=-=-=');
      console.log('=-=-=-=-=');



      let conversations

      if(userWithConversations){
        conversations = userWithConversations.UserConversations.map(convo=>convo.conversations);
      }

  
      if (conversations) {
        console.log(`Found conversations`);

        console.log('_*_*_*_*_*_*_*_*_*_*_');
        console.log('_*_*_*_*_*_*_*_*_*_*_');
        console.log('_*_*_*_*_*_*_*_*_*_*_');
        console.log('_*_*_*_*_*_*_*_*_*_*_');
        console.log(conversations);
        console.log('_*_*_*_*_*_*_*_*_*_*_');
        console.log('_*_*_*_*_*_*_*_*_*_*_');
        console.log('_*_*_*_*_*_*_*_*_*_*_');
        console.log('_*_*_*_*_*_*_*_*_*_*_');
      


        const formattedConversations = conversations.reduce((acc, conversation) => {

          acc[conversation.id] = {
            chatName: conversation.chatName,
            conversationId: conversation.id,

            users: conversation.users.reduce((userAcc, user) => {
              userAcc[user.username] = user;
              return userAcc;
            }, {}),
          

            messages: conversation.messages.map(message => {

              console.log('message??');
              const { id, content, userId, senderId } = message;
              return { conversationId: conversation.id, id, content, userId };
            }),

            notification: false,
          };
          return acc;
        }, {});

        console.log(formattedConversations);


        
        console.log('        return formattedConversations;??');
  
        return formattedConversations;
      } else {
        console.log('No conversations found');
        return null;
      }
    } catch (error) {
      console.error('Error finding conversations:', error);
  }
  },  

 

//   async startPrivateConversation(newConvoObj) {

//        let user1 = newConvoObj.sender.id
//        let user2 = newConvoObj.recipient.id
//     const user1Conversations = await User.findByPk(user1, {
//       include: [
//         {
//           model: Conversation,
//           as: 'conversations',
//           where: {
//             isTable: false
//           },
//           include: [
//             {
//               model: Message,
//               as: 'messages',
//               include: {
//                 model: User,
//                 as: 'sender',
//                 attributes: ['id', 'username'],
//               },
//             },
//             {
//               model: User,
//               as: 'users',
//               attributes: ['id', 'username'],
//             },
//           ],
//         },
//       ],
//     });


//     // Filter to find a conversation where the second user is also a participant
//     let commonConvo;
//     if(user1Conversations){
//       for (let conversation of user1Conversations.conversations) {
//         // Extract the users from the conversation
//         const participants = conversation.users.map(user => user);

//         if (participants.length > 2) {
//           continue;
//         }
//         if (participants.some(user => user.id === user2)) {
//           commonConvo = conversation;
//           break;
//         }
//       }
//     }
//     // If conversation exists, return it
//     if (commonConvo) {

//       // console.log(commonConvo);
//       const formattedConversation = {
//         tabName: getTabName(commonConvo, user1),
//         conversationId: commonConvo.id,
//         users: newConvoObj.users,
//         messages: commonConvo.messages,
//         notification: false,
//       };
//       return formattedConversation;
//     }  

//     // If not, create a new one and add both users
//     const conversation = await Conversation.create();

//     if(conversation){
//       console.log('CONVO CREATED');
//       await conversation.addUsers([user1, user2]);

//       const formattedConversation = {
//           tabName: newConvoObj.tabName,
//           conversationId: conversation.id,
//           users: newConvoObj.users,
//           messages: [],
//           notification: false,
//         };
//         return formattedConversation
//     }
//     return { message: 'Conversation not found/created' };
//   },

  
//   async sendFriendRequest(friendRequestObj) {
//     let newFriendId = friendRequestObj.newFriendId;
//     let userId = friendRequestObj.userId;
    
//     let user1Id, user2Id;
    
//     // Ensure user1Id < user2Id to prevent duplication
//     if (newFriendId > userId) {
//       user1Id = newFriendId;
//       user2Id = userId;
//     } else {
//       user1Id = userId;
//       user2Id = newFriendId;
//     }
    
//     // Check if there is any existing friendship
//     const existingFriendship = await Friendship.findOne({
//       where: {
//         user1Id: user1Id,
//         user2Id: user2Id,
//       }
//     });
    
//     // If there is no existing friendship, create a new one with status 'pending'
//     if (!existingFriendship) {
//       return await Friendship.create({
//         user1Id: user1Id,
//         user2Id: user2Id,
//         actionUserId: userId,
//         status: 'pending',
//       });
//     } else {

//       // If there is an existing friendship with status 'pending', and the other user initiated - accept the request
//       if (existingFriendship.status === 'pending' && existingFriendship.actionUserId !== userId) {
//         existingFriendship.status = 'accepted';
//         existingFriendship.actionUserId = userId;
//         return await existingFriendship.save()
//         .catch(err => {
//           console.error("There was an error saving the friendship: ", err);
//           throw err;
//       });
//       }

//       // If there is an existing friendship with status 'pending', and the we initiated - return
//       if (existingFriendship.status === 'pending' && existingFriendship.actionUserId === userId) {
//         console.log('Cannot send friend request - prior request pending');
//         return existingFriendship;
//       }

//       // If the status is 'rejected' and the actionUserId was not the current user, don't create a new one
//       if (existingFriendship.status === 'rejected' && existingFriendship.actionUserId === userId) {
//         console.log('Cannot send friend request - prior request rejected');
//         return await Friendship.create({
//           user1Id: user1Id,
//           user2Id: user2Id,
//           actionUserId: userId,
//           status: 'pending',
//         });

//         return existingFriendship;
//       }
//       // If the other user has sent a friend request, set the friendship status to 'accepted'
//       if (existingFriendship.status === 'pending' && existingFriendship.actionUserId !== userId) {
//         existingFriendship.status = 'accepted';
//         return await existingFriendship.save();
//       }
//     }
  
//     // if there is a rejected friendship and the current user is not the one who rejected it, create a new one
//     if (existingFriendship.status === 'rejected' && existingFriendship.actionUserId !== userId) {
//       return await Friendship.create({
//         user1Id: user1Id,
//         user2Id: user2Id,
//         actionUserId: userId,
//         status: 'pending',
//       });
//     }
  
//     return 'Unexpected status';
//   },

//   async acceptFriendRequest(friendRequestObj) {
//     let newFriendId = friendRequestObj.newFriendId;
//     let userId = friendRequestObj.userId;

    
    
//     let user1Id, user2Id;
    
//     // Ensure user1Id < user2Id to prevent duplication
//     if (newFriendId > userId) {
//       user1Id = newFriendId;
//       user2Id = userId;
//     } else {
//       user1Id = userId;
//       user2Id = newFriendId;
//     }
    
//     // Check if there is any existing friendship
//     const existingFriendship = await Friendship.findOne({
//       where: {
//         user1Id: user1Id,
//         user2Id: user2Id,
//       }
//     });
    
    
//     // If there is no existing friendship, return
//     if (!existingFriendship) {
//     console.log('???????????????????');
//     return 'No existing friend request to accept';

//     // user1Id` = 'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b' 
//     // AND `Friendship`.`user2Id` = 'e10d8de4-f4c7-4d28-9324-56aa9c000001'


//   } else {
//     console.log('!!!!!!!!');

//     // Check the status of the existing friendship
//     if (existingFriendship.status === 'pending' && existingFriendship.actionUserId !== userId) {
//       existingFriendship.status = 'accepted';
//       existingFriendship.actionUserId = userId;
//       return await existingFriendship.save()
//       .catch(err => {
//         console.error("There was an error saving the friendship: ", err);
//         throw err;
//     });
//     } else {
//       console.log('???????????????????');
//       return 'Cannot accept friend request - request not in pending state or not initiated by the other user';
//     }
//   }
// },


// async declineFriendRequest(friendRequestObj) {
//   let newFriendId = friendRequestObj.newFriendId;
//   let userId = friendRequestObj.userId;
  
//   let user1Id, user2Id;
  
//   if (newFriendId > userId) {
//     user1Id = newFriendId;
//     user2Id = userId;
//   } else {
//     user1Id = userId;
//     user2Id = newFriendId;
//   }

//   const existingFriendship = await Friendship.findOne({
//     where: {
//       user1Id: user1Id,
//       user2Id: user2Id,
//     }
//   });
  
//   // If there is no existing friendship, return
//   if (!existingFriendship) {
//     return 'No existing friend request to decline';
//   } else {
//     // Check the status of the existing friendship
//     if (existingFriendship.status === 'pending' && existingFriendship.actionUserId !== userId) {
//       existingFriendship.status = 'rejected';
//       existingFriendship.actionUserId = userId;
//       return await existingFriendship.save();
//     } else {
//       return 'Cannot decline friend request - request not in pending state or not initiated by the other user';
//     }
//   }
// },
  

   
// async deleteConversation(conversationId) {

//   console.log(conversationId);
//   console.log(conversationId);
//   console.log(conversationId);
//   console.log(conversationId);
//   try {
//     let conversation = await Conversation.findByPk(conversationId);

//     if (conversation) {
//       await conversation.destroy();

//       return {
//         message: "Successfully deleted",
//         statusCode: 200
//       };

//     }
//   } catch (error) {
//     console.error('Error finding conversation:', error);
//     return {
//       message: 'Error finding conversation',
//       statusCode: 500,
//       error: error
//     };
//   }
// },



  // async setNewTabName(newTabNameObj) {
  //   const { room, newTabName } = newTabNameObj;

  //   const conversation = await Conversation.findByPk(room);

  //   if (conversation) {
  //     conversation.tabName = newTabName;
  //     await conversation.save();

  //     return conversation;
  //   } else {
  //     throw new Error('Conversation not found');
  //   }
  // },



  // async leaveConversation(convoObj) {
  //   console.log('LEAVING CONVERSATION');
  //   console.log('LEAVING CONVERSATION');
  //   console.log('LEAVING CONVERSATION');
  //   console.log('LEAVING CONVERSATION');
  //   const { room, userId } = convoObj;

  //   const conversation = await UserConversation.findOne({where:{
  //     userId,
  //     conversationId: room
  //   }});


  //   if (conversation) {
  //     conversation.hasLeft = true;
  //     await conversation.save();

  //     return conversation;
  //   } else {
  //     throw new Error('Conversation not found');
  //   }
  // },



}

  
module.exports = {
  chatController
};