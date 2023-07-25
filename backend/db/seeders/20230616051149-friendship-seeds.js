'use strict';
const uuid = require('uuid');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // options.tableName = 'Friendships';


    // const userIds = [
    //   'b16f9b4c-9d72-4e21-81ea-8fcf6a7987d7',  // bigtree's id
    //   '2da2c0a2-0de9-4275-a5e5-5d91e8b8533c', // Oak's id
    //   'a83139c5-f4c2-4fc2-a223-9c9c8085f30d', // Pine's id
    //   'e10d8de4-f4cd-4d28-9324-56aa9c924a79', // Maple's id
    //   'e10d8de4-f4c2-4d28-9324-56aa9c924a80', // Birch's id
    //   'e10d8de4-f4c2-4d28-9324-56aa9c924a81', // Sequoia's id
    //   'e10d8de4-f4c7-4d28-9324-56aa9c924a82', // Aspen's id
    //   'e10d8de4-f4c7-4d28-9324-56aa9c000001', // Admin's id
    // ];

    // const otherUserIds = [
    //   'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b', // Treeeeenaa's id
    //   '87d1cb3a-b8e2-4c7e-9d80-462a523b0fcb', // Hazel's id
    // ]


    // const makeFriends = () => {
    //   let user1Id = userIds[0]
    //   let user2Id

    //   let friendshipArr = []
    //   for(let i = 1; i < userIds.length; i++){

    //     let user1, user2

    //     user2Id = userIds[i]

    //     if(user1Id > user2Id) {
    //       user1 = user1Id
    //       user2 = user2Id
    //     } else {
    //       user1 = user2Id
    //       user2 = user1Id
    //     }




    //     friendshipArr.push({
    //       id: uuid.v4(),
    //       user1Id: user1,
    //       user2Id : user2,
    //       actionUserId: user1Id,
    //       status: 'accepted',
    //     })
    //   }

    //   return friendshipArr
    // }

    // let friendEntries = makeFriends()

    // let allEntries = [
    //   ...friendEntries, 
    //   {
    //     id: uuid.v4(),
    //     user1Id: otherUserIds[0], // Bigtree
    //     user2Id: userIds[0], // Treeeena
    //     actionUserId: otherUserIds[0], // action taken by Treeeena
    //     status: 'pending',
    //   },


    //   {
    //     id: uuid.v4(),
    //     user1Id: 'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b', // Treeeeenaa's id
    //     user2Id: 'a83139c5-f4c2-4fc2-a223-9c9c8085f30d', // Pine's id
    //     actionUserId: 'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b', // Treeeeenaa's id
    //     status: 'accepted',
    //   },
    //   {
    //     id: uuid.v4(),
    //     user1Id: 'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b', // Treeeeenaa's id
    //     user2Id: 'e10d8de4-f4c2-4d28-9324-56aa9c924a80', // Birch's id
    //     actionUserId: 'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b', // Treeeeenaa's id
    //     status: 'accepted',
    //   },



    //   {
    //     id: uuid.v4(),
    //     user1Id: userIds[0], // Bigtree
    //     user2Id: otherUserIds[1], // Hazel
    //     actionUserId: otherUserIds[1], // action taken by Hazel
    //     status: 'rejected',
    //   },
    // ]


    // await queryInterface.bulkInsert(options, allEntries, {});
  },

  down: async (queryInterface, Sequelize) => {
    // options.tableName = 'Friendships';
    // return queryInterface.bulkDelete(options, {});
  },
};