// backend/config/database.js
const config = require('./index');

module.exports = {
  development: {
    storage: config.dbFile,
    dialect: "sqlite",
    seederStorage: "sequelize",
    logQueryParameters: true,
    typeValidation: true
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    seederStorage: 'sequelize',
    dialectOptions: {
      ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=disable')
        ? false
        : { require: true, rejectUnauthorized: false }
    },
    define: {
      schema: process.env.SCHEMA
    }
  }
};