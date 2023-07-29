'use strict';
const { Model, Validator } = require('sequelize');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {



    toSafeObject() {
      const { id, firstName, lastName, email, username, chips, userRoom, rank, balance  } = this; // context will be the User instance
      return { id, firstName, lastName, email, username, chips, userRoom, rank, balance };
    }

    validatePassword(password) {
      return bcrypt.compareSync(password, this.hashedPassword.toString());
    }

    static getCurrentUserById(id) {
      return User.scope('currentUser').findByPk(id);
    }

    static async login({ credential, password }) {
      const { Op } = require('sequelize');
      const user = await User.scope('loginUser').findOne({
        where: {
          [Op.or]: {
            username: credential,
            email: credential,
          },
        },
      });
      if (user && user.validatePassword(password)) {
        return await User.scope('currentUser').findByPk(user.id);
      }
    }

    static async signup({ firstName, lastName, username, email, password }) {

      const hashedPassword = bcrypt.hashSync(password);

      const user = await this.create({
        firstName,
        lastName,
        username,
        email,
        hashedPassword,
      });
      if(user)return await User.scope('currentUser').findByPk(user.id);
      if(!user) return {I:'am a teapot'}
    }

    static associate(models) {
      User.hasMany(models.UserTable, { foreignKey: 'userId', as: 'tables' });

      User.hasMany(models.Friendship, { foreignKey: 'user1Id', as: 'user1Id' });
      User.hasMany(models.Friendship, { foreignKey: 'user2Id', as: 'user2Id', });
      User.hasMany(models.Friendship, {foreignKey: 'actionUserId', as: 'actionUser' });


      User.belongsToMany(models.Table, { through: 'UserTables', foreignKey: 'userId', as: 'userTables' });

      
      User.hasMany(models.Action, { foreignKey: 'userId'});
      
      User.belongsToMany(models.Pot, { through: 'UserPot', foreignKey: 'userId', as: 'pots' });
      User.hasMany(models.Table, {foreignKey:'userId'})
      
      User.hasMany(models.Message, { foreignKey: 'userId'});
      User.belongsToMany(models.Conversation, { through: 'UserConversation', foreignKey: 'userId', as: 'conversations' });
      User.hasMany(models.UserConversation, {foreignKey:'userId'})
    
    
    }


  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuid.v4(), 
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error('Cannot be an email.');
            }
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [3, 256],
          isEmail: true,
        },
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 360],
        },
      },
      balance: {
        type: DataTypes.INTEGER,
      },
      isMuted: {
        type: DataTypes.BOOLEAN,
      },
      rank: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt'],
        },
      },
      scopes: {
        currentUser: {
          attributes: { exclude: ['hashedPassword'] },
        },
        loginUser: {
          attributes: {},
        },
      },
    }
  );
  return User;
};
