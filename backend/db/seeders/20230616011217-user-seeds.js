'use strict';
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = { 
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    options.tableName = 'Users';
    return queryInterface.bulkInsert(options, [

      {
        id:'b16f9b4c-9d72-4e21-81ea-8fcf6a7987d7',
        firstName: 'Doug',
        lastName: 'Lasfirr',
        email: 'bigtreelittleaxe@user.io',
        username: 'bigtree',
        hashedPassword: await bcrypt.hash('password', salt),
        balance: 90000
      },
      {
        id:'e87a6a96-6ebc-4ef3-b6a1-3058b136f34b',
        firstName: 'Treeeeenaa',
        lastName: 'Pine',
        email: 'needles@user.io',
        username: 'Treeeeenaa',
        hashedPassword: await bcrypt.hash('password', salt),
        balance: 1000000
      },
      {
        id:'87d1cb3a-b8e2-4c7e-9d80-462a523b0fcb',
        firstName: 'Hazel',
        lastName: 'Forest',
        email: 'ownlintree@user.io',
        username: 'Hazel',
        hashedPassword: await bcrypt.hash('password', salt),
        balance: 900
      },
      {
        id:"2da2c0a2-0de9-4275-a5e5-5d91e8b8533c",
        firstName: 'Oak',
        lastName: 'Branch',
        email: 'treehugger@user.io',
        username: 'Spruce',
        hashedPassword: await bcrypt.hash('password', salt),
        balance: 90000
      },
      {
        id:"a83139c5-f4c2-4fc2-a223-9c9c8085f30d",
        firstName: 'Willow',
        lastName: 'Root',
        email: 'treelover@user.io',                                                    // PINE
        username: 'Pine',
        hashedPassword: await bcrypt.hash('password2', salt),
        balance: 90000

      },
      {
        id:"e10d8de4-f4cd-4d28-9324-56aa9c924a79",
        firstName: 'Maple',
        lastName: 'Leaf',
        email: 'woodman@user.io',
        username: 'OakLeaf',
        hashedPassword: await bcrypt.hash('password3', salt),
        balance: 90000
      },
      {
        id:"e10d8de4-f4c2-4d28-9324-56aa9c924a80",
        firstName: 'Birch',
        lastName: 'Twig',
        email: 'arborist@user.io',
        username: 'Willow',                                                           // WILLOW
        hashedPassword: await bcrypt.hash('password4', salt),
        balance: 90000
      },
      {
        id:"e10d8de4-f4c2-4d28-9324-56aa9c924a81",
        firstName: 'Sequoia',
        lastName: 'Cone',
        email: 'treeclimber@user.io',
        username: 'Cedar',                                                           // CEDAR
        hashedPassword: await bcrypt.hash('password5', salt),
        balance: 90000
      },
      {
        id:"e10d8de4-f4c7-4d28-9324-56aa9c924a82",
        firstName: 'Aspen',
        lastName: 'Bark',
        email: 'forester@user.io',
        username: 'ElmWood',
        hashedPassword: await bcrypt.hash('password6', salt),
        balance: 90000
      },
        {
        id:"e10d8de4-f4c7-4d28-9324-56aa9c000001",
        firstName: 'Dono',
        lastName: 'C',
        email: 'admin@gmail.com',
        username: 'admin',
        hashedPassword: await bcrypt.hash('password', salt),
        balance: 90000
      },

      {
        id:"e10d8de4-f4c7-0000-0000-000000000000",
        firstName: 'room',
        lastName: 'admin',
        email: 'room-admin@gmail.com',
        username: 'Room',
        hashedPassword: await bcrypt.hash('strongpassword', salt),
        balance: 90000
      },

      // bots
      {
        id:"e10d8de4-f4c8-4d28-9324-56aa9c924a83",
        firstName: 'Jeffrey',
        lastName: 'Ma',
        email: 'jeffrey.ma@user.io',
        username: 'Jeff Ma',
        hashedPassword: await bcrypt.hash('password', salt),
        balance: 300000
    },
    {
        id:"e10d8de4-f4c8-4d28-9324-56aa9c924a84",
        firstName: 'John',
        lastName: 'Chang',
        email: 'john.chang@user.io',
        username: 'John Chang',
        hashedPassword: await bcrypt.hash('password', salt),
        balance: 300000
    },
    {
        id:"e10d8de4-f4c8-4d28-9324-56aa9c924a85",
        firstName: 'Bill',
        lastName: 'Kaplan',
        email: 'bill.kaplan@user.io',
        username: 'Bill Kaplan',
        hashedPassword: await bcrypt.hash('password', salt),
        balance: 300000
    },
    {
        id:"e10d8de4-f4c8-4d28-9324-56aa9c924a86",
        firstName: 'Mike',
        lastName: 'Aponte',
        email: 'mike.aponte@user.io',
        username: 'Mike Aponte',
        hashedPassword: await bcrypt.hash('password', salt),
        balance: 300000
    },
    {
        id:"e10d8de4-f4c8-4d28-9324-56aa9c924a87",
        firstName: 'Jane',
        lastName: 'Willis',
        email: 'jane.willis@user.io',
        username: 'Jane Willis',
        hashedPassword: await bcrypt.hash('password', salt),
        balance: 300000
    },
    {
      id:"e10d8de4-f4c8-4d28-9324-56aa9c924a88",
      firstName: 'Semyon',
      lastName: 'Dukach',
      email: 'semyon.dukach@user.io',
      username: 'Semyon Dukach',
      hashedPassword: await bcrypt.hash('password', salt),
      balance: 300000
  }
    













    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {});
  }
};
