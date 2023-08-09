'use strict';
const uuid = require('uuid');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const userIds = [
      {id: 'b16f9b4c-9d72-4e21-81ea-8fcf6a7987d7', username: 'bigtree'},
      {id: '2da2c0a2-0de9-4275-a5e5-5d91e8b8533c', username: 'Spruce'},
      {id: 'a83139c5-f4c2-4fc2-a223-9c9c8085f30d', username: 'Pine'},
      {id: 'e10d8de4-f4cd-4d28-9324-56aa9c924a79', username: 'OakLeaf'},
      {id: 'e10d8de4-f4c2-4d28-9324-56aa9c924a80', username: 'Willow'},
      {id: 'e10d8de4-f4c2-4d28-9324-56aa9c924a81', username: 'Cedar'},
      {id: 'e10d8de4-f4c7-4d28-9324-56aa9c924a82', username: 'ElmWood'},
      {id: 'e10d8de4-f4c7-4d28-9324-56aa9c000001', username: 'admin'},
    ];
    
    const otherUserIds = [
      {id: 'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b', username: 'Treeeeenaa'},
      {id: '87d1cb3a-b8e2-4c7e-9d80-462a523b0fcb', username: 'Hazel'},
    ];

    const convoUUIDs = [
      'e87a6a00-6ebc-0ef0-b6a0-3058b1360001',
      'e87a6a00-6ebc-0ef0-b6a0-3058b1360002',
      'e87a6a00-6ebc-0ef0-b6a0-3058b1360003',
      'e87a6a00-6ebc-0ef0-b6a0-3058b1360004',
      'e87a6a00-6ebc-0ef0-b6a0-3058b1360005',
      'e87a6a00-6ebc-0ef0-b6a0-3058b1360006',
      'e87a6a00-6ebc-0ef0-b6a0-3058b1360007',
      'e87a6a00-6ebc-0ef0-b6a0-3058b1360008',
      'e87a6a00-6ebc-0ef0-b6a0-3058b1360009',
    ];


    


// Create Conversations

    options.tableName = 'Conversations';


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

    const makeConversations = () => {

      let user1Name = userIds[0].username
      let conversations = [];

      for(let i = 1; i < userIds.length; i++){

        let user2Name = userIds[i].username
        let conversationId = convoUUIDs[i]

        console.log(conversationId);


        let conversation = {
          id: conversationId,
          tableId: null,
          isDirectMessage: true, 
          chatName: getChatName([user1Name, user2Name])
        }
    
        conversations.push(conversation);
      }
    
      return conversations;
    }

    let convosToAdd = makeConversations()    
    await queryInterface.bulkInsert(options, convosToAdd, {});





// ADD UserConversations
    options.tableName = 'UserConversations';


    const makeUserConversations = () => {
      let userConversations = [];

      let user1Id = userIds[0].id
    
      for (let i = 1; i < convosToAdd.length+1; i++) {

        let user2Id = userIds[i].id
        let conversationId = convoUUIDs[i]

        let userConversation1 = {
          id: uuid.v4(),
          userId: user1Id,
          conversationId,
          notification: false,
          hasLeft: false,
        }
    
        let userConversation2 = {
          id: uuid.v4(),
          userId: user2Id,
          conversationId,
          notification: false,
          hasLeft: false,
        }
    
        userConversations.push(userConversation1, userConversation2);
      }
    
      return userConversations;
    }


    let userConvosToAdd = makeUserConversations()    



    await queryInterface.bulkInsert(options, userConvosToAdd, {});


// ADD FRIENDSHIPS



    options.tableName = 'Friendships';
    const makeFriends = () => {
      let user1Id = userIds[0].id

      let friendshipArr = []
      for(let i = 1; i < userIds.length; i++){

        let user1, user2

        let user2Id = userIds[i].id
        let conversationId = convoUUIDs[i]
        

        if(user1Id > user2Id) {
          user1 = user1Id
          user2 = user2Id
        } else {
          user1 = user2Id
          user2 = user1Id
        }


        friendshipArr.push({
          id: uuid.v4(),
          user1Id: user1,
          user2Id : user2,
          actionUserId: user1Id,
          status: 'accepted',
          conversationId
        })
      }

      return friendshipArr
    }

    let friendEntries = makeFriends()

    let allEntries = [
      ...friendEntries, 
      {
        id: uuid.v4(),
        user1Id: otherUserIds[0].id, // Bigtree
        user2Id: userIds[0].id, // Treeeena
        actionUserId: otherUserIds[0].id, // action taken by Treeeena
        status: 'pending',
      },
    ]


    await queryInterface.bulkInsert(options, allEntries, {});





  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Friendships';
    await queryInterface.bulkDelete(options, {});
    options.tableName = 'Conversations';
    await queryInterface.bulkDelete(options, {});
    options.tableName = 'userConversations';
    return queryInterface.bulkDelete(options, {});
  },
};