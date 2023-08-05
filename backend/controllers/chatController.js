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
const { Op } = require('sequelize');
const Sequelize = require('sequelize');

const chatController = {
  async createMessage(messageObj, userId) {
    const { conversationId, content } = messageObj;

    const newMessage = await Message.create({
      userId,
      conversationId,
      content,
    });

    if (!newMessage) {
      return false;
    }
    return newMessage;
  },

  async editMessage(messageObj, userId) {
    const { messageId, newContent } = messageObj;

    const newMessage = await Message.findByPk(messageId);

    if (!newMessage || newMessage.userId !== userId) {
      return false;
    }

    newMessage.content = newContent;
    await newMessage.save();
    return newMessage;
  },

  async deleteMessage(messageObj, userId) {
    const { messageId } = messageObj;

    const message = await Message.findByPk(messageId);

    if (!message || message.userId !== userId) {
      return false;
    }

    await message.destroy();
    return true;
  },

  async getUserConversations(userId) {
    try {
      const userConversations = await UserConversation.findAll({
        where: {
          hasLeft: false,
          userId,
        },
        include: [
          {
            model: Conversation,
            as: 'conversations',
            where: {
              tableId: null,
              // isDirectMessage: false,
            },
            include: [
              {
                model: Message,
                as: 'messages',
                include: [
                  {
                    model: User,
                    attributes: ['id', 'username', 'rank'],
                  },
                ],
              },
            ],
          },
        ],
        order: [
          ['conversations', 'createdAt', 'ASC'],
          ['conversations', 'messages', 'id', 'ASC'],
        ],
      });

      let conversations;
      if (userConversations) {
        conversations = userConversations.map((convo) => {
          console.log('<><><><><><><><><><><><><><>');
          console.log('<><><><><><><><><><><><><><>');
          console.log(convo.hasLeft);
          console.log(convo);
          console.log('<><><><><><><><><><><><><><>');
          console.log('<><><><><><><><><><><><><><>');
          return convo.conversations;
        });
      }

      // console.log('-=-=-=-=-=-=-=-=-=');
      // console.log('-=-=-=-=-=-=-=-=-=');
      // console.log('-=-=-=-=-=-=-=-=-=');
      // console.log('-=-=-=-=-=-=-=-=-=');
      // console.log(userConversations[2]);
      // console.log('<><><><><><><><><><><><><><>');
      // console.log('<><><><><><><><><><><><><><>');

      // console.log(userConversations[2].conversations);
      // // id: 'b0b487ff-eca5-43a2-8a07-0e216ff83b08',

      // console.log('-=-=-=-=-=-=-=-=-=');
      // console.log('-=-=-=-=-=-=-=-=-=');
      // console.log('-=-=-=-=-=-=-=-=-=');
      // console.log('-=-=-=-=-=-=-=-=-=');

      if (conversations) {
        const formattedConversations = conversations.reduce(
          (acc, conversation) => {
            acc[conversation.id] = {
              chatName: conversation.chatName,
              conversationId: conversation.id,
              isDirectMessage: conversation?.isDirectMessage,
              hasDefaultChatName: conversation?.hasDefaultChatName,

              messages: conversation.messages.map((message) => {
                const { id, content, userId, User, createdAt } = message;
                return {
                  conversationId: conversation.id,
                  id,
                  content,
                  userId,
                  username: User.username,
                  createdAt,
                };
              }),

              notification: false,
            };
            return acc;
          },
          {}
        );

        return formattedConversations;
      } else {
        console.log('No conversations found');
        return null;
      }
    } catch (error) {
      console.error('Error finding conversations:', error);
    }
  },

  async startConversation(convoObj, userId, username) {
    let friendListIds = [...convoObj.friendListIds, userId];
    let usernames = [...convoObj.friendListNames, username];
    let chatName = convoObj.chatName;

    const newConversation = await Conversation.create({
      chatName,
      hasDefaultChatName: false,
      isDirectMessage: false,
    });

    if (newConversation) {
      for (let id of friendListIds) {
        await newConversation.addUser(id);
      }

      const formattedConversation = {
        id: newConversation.id,
        chatName: newConversation.chatName,
        isDirectMessage: newConversation.isDirectMessage,
        hasDefaultChatName: newConversation.hasDefaultChatName,
        conversationId: newConversation.id,
        users: [usernames],
        messages: [],
        notification: false,
      };
      return formattedConversation;
    }

    return { message: 'Conversation not found/created' };
  },

  async addFriendsToConversation(convoObj) {
    const { conversationId, friendListIds } = convoObj;

    const conversation = await Conversation.findByPk();

    if (!conversation) {
      return false
    }
    
    if (conversation) {
      for (let id of friendListIds) {
        await conversation.addUser(id);
      }

      const formattedConversation = {
        id: conversation.id,
        chatName: conversation.chatName,
        isDirectMessage: conversation.isDirectMessage,
        hasDefaultChatName: conversation.hasDefaultChatName,
        conversationId: conversation.id,
        messages: [],
        notification: false,
      };
      return formattedConversation;
    }

    return { message: 'Conversation not found/created' };
  },

  async leaveConversation(conversationId, userId) {

    const conversation = await UserConversation.findOne({
      where: {
        userId,
        conversationId: conversationId,
      },
    });

    if (!conversation) {
      return false;
    }

    conversation.hasLeft = true;
    await conversation.save();
    return true;
  },

  async changeChatName(changeObj) {
    const { newChatName, conversationId } = changeObj;

    if (!newChatName.trim().length) {
      return false;
    }

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) return false;
    conversation.chatName = newChatName;
    conversation.hasDefaultChatName = false;
    await conversation.save();
    return true;
  },

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
};

module.exports = {
  chatController,
};
