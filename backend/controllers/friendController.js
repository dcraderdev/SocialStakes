const { User, Friendship } = require('../db/models');


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

    console.log(existingFriendship);
    console.log(existingFriendship.status === 'pending');
    console.log(existingFriendship.status === 'rejected');
    console.log(existingFriendship.status === 'accepted');
    console.log(existingFriendship.actionUserId);

    // If there is no existing friendship, create a new one with status 'pending'
    if (!existingFriendship) {
      return await Friendship.create({
        user1Id: user1Id,
        user2Id: user2Id,
        actionUserId: userId,
        status: 'pending',
      });
    } else {
      // If there is an existing friendship with status 'pending', and the other user initiated - accept the request
      if (
        existingFriendship.status === 'pending' &&
        existingFriendship.actionUserId !== userId
      ) {
        existingFriendship.status = 'accepted';
        existingFriendship.actionUserId = userId;
        return await existingFriendship.save().catch((err) => {
          console.error('There was an error saving the friendship: ', err);
          throw err;
        });
      }

      // If there is an existing friendship with status 'pending', and the we initiated - return
      if (
        existingFriendship.status === 'pending' &&
        existingFriendship.actionUserId === userId
      ) {
        console.log('Cannot send friend request - prior request pending');
        return existingFriendship;
      }

      // If the status is 'rejected' and the actionUserId was not the current user, don't create a new one
      if (
        existingFriendship.status === 'rejected' &&
        existingFriendship.actionUserId === userId
      ) {
        console.log('Cannot send friend request - prior request rejected');
        return await Friendship.create({
          user1Id: user1Id,
          user2Id: user2Id,
          actionUserId: userId,
          status: 'pending',
        });

        return existingFriendship;
      }
      // If the other user has sent a friend request, set the friendship status to 'accepted'
      if (
        existingFriendship.status === 'pending' &&
        existingFriendship.actionUserId !== userId
      ) {
        existingFriendship.status = 'accepted';
        return await existingFriendship.save();
      }
    }

    // if there is a rejected friendship and the current user is not the one who rejected it, create a new one
    if (
      existingFriendship.status === 'rejected' &&
      existingFriendship.actionUserId !== userId
    ) {
      return await Friendship.create({
        user1Id: user1Id,
        user2Id: user2Id,
        actionUserId: userId,
        status: 'pending',
      });
    }

    return 'Unexpected status';
  },




  async acceptFriendRequest(friendRequestObj) {
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
      console.log('???????????????????');
      return 'No existing friend request to accept';

      // user1Id` = 'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b'
      // AND `Friendship`.`user2Id` = 'e10d8de4-f4c7-4d28-9324-56aa9c000001'
    } else {
      console.log('!!!!!!!!');

      // Check the status of the existing friendship
      if (
        existingFriendship.status === 'pending' &&
        existingFriendship.actionUserId !== userId
      ) {
        existingFriendship.status = 'accepted';
        existingFriendship.actionUserId = userId;
        return await existingFriendship.save().catch((err) => {
          console.error('There was an error saving the friendship: ', err);
          throw err;
        });
      } else {
        console.log('???????????????????');
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
};

module.exports = {
  friendController,
};
