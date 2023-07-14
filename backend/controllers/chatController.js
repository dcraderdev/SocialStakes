const { Card, Deck, User, Friendship, UserFriendship, UserHand, Game, Table, UserGame, UserTable, DeckCard, Message, Conversation, UserConversation } = require('../db/models');
const { Op } = require('sequelize');
const Sequelize  = require('sequelize');






// function getTabName(conversation, userId){


//   if(conversation.isGeneral){
//     return 'General'
//   }

//   if(conversation.tabName){
//     return conversation.tabName
//   }

//   if(conversation.users?.length === 2){
//     return conversation.users[0].id === userId ? conversation.users[1].username : conversation.users[0].username
//   }

//   if(conversation.users?.length > 2){
//     let tabName = conversation.users.map(user => user.username + ', ')
//     return tabName
//   }

//   return 'Unknown'
// }

const chatController = {



async createMessage(messageObj) {
  const {user,tableId, content} = messageObj
  let userId = user.id

  console.log(user,tableId, content);

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

//   async getConversations(userId) {
//     console.log('getting convos');

//     console.log(userId);

//     try {
//       // const userWithConversations = await User.findByPk(userId, {
//       //   include: [
//       //     {
//       //       model: Conversation,
//       //       as: 'conversations',
//       //       where: {
//       //         isTable: false,
//       //       },
//       //       include: [
//       //         {
//       //           model: Message,
//       //           as: 'messages',
//       //           include: {
//       //             model: User,
//       //             as: 'sender',
//       //             attributes: ['id', 'username'],
//       //           },
//       //         },
//       //         {
//       //           model: User,
//       //           as: 'users',
//       //           attributes: ['id', 'username'],
//       //         },
//       //       ],
//       //     }
//       //   ],
//       // });

//       // const userConversations = await User.findAll({
//       //   where: { id: userId },
//       //   include: [{
//       //     model: UserConversation,
//       //     as: 'UserConversations',
//       //     where: { hasLeft: false },
//       //     include: [{
//       //       model: Conversation,
//       //       as: 'conversations',
//       //     }],
//       //   }],
//       // });


//       const userWithConversations = await User.findByPk(userId, {
//         include: [{
//           model: UserConversation,
//           as: 'UserConversations',
//           where: { hasLeft: false },
//           include: [{
//             model: Conversation,
//             as: 'conversations',
//             where: {
//               isTable: false,
//             },
//             include: [
//               {
//                 model: Message,
//                 as: 'messages',
//                 include: {
//                   model: User,
//                   as: 'sender',
//                   attributes: ['id', 'username', 'userRoom', 'rank'],
//                 },
//               },
//               {
//                 model: User,
//                 as: 'users',
//                 attributes: ['id', 'username', 'rank',],
//               },
//             ],
//           }],
//         }],
//       });
      

    
//     const generalConversations = await Conversation.findAll({
//       where: { isGeneral: true },
//       include: [
//         {
//           model: Message,
//           as: 'messages',
//           include: {
//             model: User,
//             as: 'sender',
//             attributes: ['id', 'username', 'userRoom', 'rank'],
//           },
//         },
//         {
//           model: User,
//           as: 'users',
//           attributes: ['id', 'username', 'rank'],
//           required: false
//         },
//       ]
//     });


//     const usersFriendships = await Friendship.findAll( {
//         where: {
//           status: { [Op.or]: ['accepted', 'pending'] },
//           [Op.or]: [
//             { user1Id: userId },
//             { user2Id: userId },
//           ],
//         }, 
//         include: [
//           {
//           model: User,
//           as: 'user2',
//           attributes: ['id', 'username', 'userRoom', 'rank'],
//           },
//           {
//             model: User,
//             as: 'user1',
//             attributes: ['id', 'username', 'userRoom', 'rank'],
//           }
//       ],
//         attributes: ['id', 'status', 'actionUserId'],
//     });




//       // NOt returning correct conversations upon loading in. only showing the regular tabs and not the hidden tabs
//       // but only for bigtree who got a group invite and then a tab name switch before finally messaging back 
//       // after startiong new convo wiht [msg] button all the convos pop up but the one pops up 2x

//       let friendships = { incomingRequests: {}, outgoingRequests: {}, friends: {} };

//       const formattedResults = usersFriendships.reduce((acc, friendship) => {
//         const { id, status, user1, user2, actionUserId } = friendship;
//         let friend, isOutgoingRequest;


      
//         if (user1.id === userId) {
//           // If user1 is the current user, use user2's data
//           friend = user2;
//           isOutgoingRequest = actionUserId === userId;
//         } else {
//           // If user2 is the current user, use user1's data
//           friend = user1;
//           isOutgoingRequest = actionUserId === userId;
//         }
      
//         const formattedFriendship = { id, friend, status };
      
//         if (status === 'accepted') {
//           acc.friends[friend.username] = formattedFriendship;
//         } else if (status === 'pending') {
//           if (isOutgoingRequest) {
//             acc.outgoingRequests[friend.username] = formattedFriendship;
//           } else {
//             acc.incomingRequests[friend.username] = formattedFriendship;
//           }
//         }
      
//         return acc;
//       }, friendships);
      
      
//       // console.log('=-=-=-=-=');
//       // console.log(userWithConversations);


//       // let convos = []

//       // if(userWithConversations){
//       //   console.log(userWithConversations.UserConversations.map(convo=>{
//       //     convos.push(convo.conversations)
//       //   }));
//       // }


//       let convos
//       if(userWithConversations){
//         convos = userWithConversations.UserConversations.map(convo=>convo.conversations);
//       }

//       let conversations
//       if(userWithConversations){
//         conversations = [...convos, ...generalConversations];

//       } else {
//         conversations = [...generalConversations];
//       }
  
  
//       if (conversations) {
//         console.log(`Found conversations`);
      


//         const formattedConversations = conversations.reduce((acc, conversation) => {
//           let tabName = getTabName(conversation, userId)
//           acc[conversation.id] = {
//             tabName,
//             conversationId: conversation.id,

//             users: conversation.users.reduce((userAcc, user) => {
//               userAcc[user.username] = user;
//               return userAcc;
//             }, {}),
          

//             messages: conversation.messages.map(message => {

//               console.log('message??');
//               const { id, content, sender, senderId } = message;
//               return { conversationId: conversation.id, id, content, sender };
//             }),

//             notification: false,
//           };
//           return acc;
//         }, {});

//         // console.log(formattedConversations);


//         // Set empty friends array if no friends are found
//         formattedConversations.friends = friendships || [];
        
  
//         return formattedConversations;
//       } else {
//         console.log('No conversations found');
//         return null;
//       }
//     } catch (error) {
//       console.error('Error finding conversations:', error);
//   }
//   },  

 

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