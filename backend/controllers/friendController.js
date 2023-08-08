const { User, Friendship, Conversation } = require('../db/models');
const { Op } = require("sequelize");




const getChatName = (usernames) =>{
  let sortedNames = usernames.sort((a, b) => {
     a = a.toLowerCase();
     b = b.toLowerCase();
 
     if (a < b) return -1;
     if (a > b) return 1;
 
     return 0;
 });
   return sortedNames.join(', ')
 }


const friendController = {
  async sendFriendRequest(friendRequestObj) {
    const {userId, recipientId} = friendRequestObj;

    let user1Id, user2Id;

    // Ensure user1Id < user2Id to prevent duplication
    if (recipientId > userId) {
      user1Id = recipientId;
      user2Id = userId;
    } else {
      user1Id = userId;
      user2Id = recipientId;
    }

    // Check if there is any existing friendship
    const existingFriendship = await Friendship.findOne({
      where: {
        user1Id: user1Id,
        user2Id: user2Id,
      },
    });
    
    // If there is no existing friendship, create a new one with status 'pending'
    if (!existingFriendship) {
      const newFriendship = await Friendship.create({
        user1Id: user1Id,
        user2Id: user2Id,
        actionUserId: userId,
        status: 'pending',
      });

      return {
        friendship: newFriendship,
        newConversation: null
    };

    } else {
      // If there is an existing friendship with status 'pending', and the other user initiated - accept the request
      if (
        existingFriendship.status === 'pending' &&
        existingFriendship.actionUserId !== userId
      ) {

        const newConversation = await this.startConversation(friendRequestObj)
        
        existingFriendship.status = 'accepted';
        existingFriendship.conversationId = newConversation.id;
        existingFriendship.actionUserId = userId;
        
        try {
          await existingFriendship.save();
          return {
              friendship: existingFriendship,
              newConversation
          };
        } catch (err) {
            console.error('There was an error saving the friendship: ', err);
            throw err;
        }
        }
        // If there is an existing friendship with status 'pending', and the we initiated - return
        if (
          existingFriendship.status === 'pending' &&
          existingFriendship.actionUserId === userId
        ) {
          console.log('Cannot send friend request - prior request pending');
          return {
            friendship: existingFriendship,
            newConversation: null
        };
        }

        // if there is a rejected friendship and the current user is not the one who rejected it, create a new one
        if (
          existingFriendship.status === 'rejected' &&
          existingFriendship.actionUserId === userId
        ) {
          existingFriendship.status = 'pending';
          existingFriendship.actionUserId = userId;
          await existingFriendship.save()

          return {
            friendship: {
              existingFriendship:{
                status: 'pending'
              } 
            },
            newConversation: null
          };
        }
    }
    return false;
  },



  

  async startConversation(friendRequestObj) {
    const {userId, username, recipientId, recipientUsername} = friendRequestObj;
    let usernames = [username, recipientUsername]

    // If not, create a new one and add both users
    chatName = getChatName(usernames)
    const conversation = await Conversation.create({chatName, isDirectMessage: true, hasDefaultChatName:true});
    if(conversation){
      await conversation.addUsers([userId, recipientId]);
      return conversation
    }
    return false;
  },






  async acceptFriendRequest(friendRequestObj) {
    // console.log('-----acceptFriendRequest------');
    // console.log('----------------------');
    const {userId, recipientId} = friendRequestObj;
    let user1Id, user2Id;

    // Ensure user1Id < user2Id to prevent duplication
    if (recipientId > userId) {
      user1Id = recipientId;
      user2Id = userId;
    } else {
      user1Id = userId;
      user2Id = recipientId;
    }


    // Check if there is any existing friendship
    const existingFriendship = await Friendship.findOne({
      where: {
        user1Id: user1Id,
        user2Id: user2Id,
      },
    });

    // If there is no existing friendship, return
    if (!existingFriendship) {
      return false;
    } else {

      // Check the status of the existing friendship
      if (
        existingFriendship.status === 'pending' &&
        existingFriendship.actionUserId !== userId
      ) {

        const newConversation = await this.startConversation(friendRequestObj)
        existingFriendship.status = 'accepted';
        existingFriendship.conversationId = newConversation.id;
        existingFriendship.actionUserId = userId;
        
        try {
          await existingFriendship.save();
          return {
              friendship: existingFriendship,
              newConversation
          };
        }catch(err){
          console.error('There was an error saving the friendship: ', err);
          throw err;

        }
      } else {
        return 'Cannot accept friend request - request not in pending state or not initiated by the other user';
      }
    }
  },
 
  async declineFriendRequest(friendRequestObj) {
    const {userId, recipientId} = friendRequestObj;


    let user1Id, user2Id;

    if (recipientId > userId) {
      user1Id = recipientId;
      user2Id = userId;
    } else {
      user1Id = userId;
      user2Id = recipientId;
    }

    const existingFriendship = await Friendship.findOne({
      where: {
        user1Id: user1Id,
        user2Id: user2Id,
      },
    });

    // If there is no existing friendship, return
    if (!existingFriendship) {
      return 'No existing friend request to decline';
    } else {
      // Check the status of the existing friendship
      if (
        existingFriendship.status === 'pending' &&
        existingFriendship.actionUserId !== userId
      ) {

        existingFriendship.status = 'rejected';
        existingFriendship.actionUserId = userId;
        return await existingFriendship.save();
      } else {
        return 'Cannot decline friend request - request not in pending state or not initiated by the other user';
      }
    }
  },

  async cancelFriendRequest(friendRequestObj) {
    const {friendshipId} = friendRequestObj;


    const existingFriendship = await Friendship.findByPk(friendshipId);

    // If there is no existing friendship, return
    if (!existingFriendship) {
      return false;
    } 

    return await existingFriendship.destroy()

    
  },

  async getUserFriends(userId){

    const usersFriendships = await Friendship.findAll( {
      where: {
        status: { [Op.or]: ['accepted', 'pending', 'rejected'] },
        [Op.or]: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      }, 
      include: [
        {
        model: User,
        as: 'user2',
        attributes: ['id', 'username', 'rank'],
        },
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'username', 'rank'],
        }
    ],
      attributes: ['id', 'status', 'actionUserId', 'conversationId'],
  });

    if(!usersFriendships){
      return false
    }

    let friendships = { incomingRequests: {}, outgoingRequests: {}, rejectedRequests: {}, friends: {} };

    const formattedResults = usersFriendships.reduce((acc, friendship) => {
      const { id, status, user1, user2, actionUserId, conversationId } = friendship;
      let friend, isOutgoingRequest;

      if (user1.id === userId) {
        // If user1 is the current user, use user2's data
        friend = user2;
        isOutgoingRequest = actionUserId === userId;
      } else {
        // If user2 is the current user, use user1's data
        friend = user1;
        isOutgoingRequest = actionUserId === userId;
      }
    
      const formattedFriendship = { id, friend, status, conversationId };
    
      if (status === 'accepted') {
        acc.friends[friend.id] = formattedFriendship;
      } else if (status === 'pending') {
        if (isOutgoingRequest) {
          acc.outgoingRequests[friend.id] = formattedFriendship;
        } else {
          acc.incomingRequests[friend.id] = formattedFriendship;
        }
      } else if(status === 'rejected'){
        if(actionUserId !== userId){
          acc.rejectedRequests[friend.id] = formattedFriendship;
        }
      }
    
      return acc;
    }, friendships);

    return formattedResults
  },


async removeFriend(userId, friendObj){

  const {friendshipId,friendId} = friendObj

  const existingFriendship = await Friendship.findByPk(friendshipId);

  if(!existingFriendship){
    return false
  }

  // Check if users are valid in the friendship
  if (
    (existingFriendship.user1Id === userId && existingFriendship.user2Id === friendId) ||
    (existingFriendship.user1Id === friendId && existingFriendship.user2Id === userId)
  ) {

    console.log(existingFriendship);
console.log(existingFriendship.conversationId);

    const existingConversation = await Conversation.findByPk(existingFriendship.conversationId);

    if(existingConversation) {
      await existingConversation.destroy()
    }
    await existingFriendship.destroy();

  } else {
    console.log('Invalid users for this friendship.');
    return false;
  }




}







};

module.exports = {
  friendController,
};
