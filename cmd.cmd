npx sequelize-cli model:generate --name User --attributes username:string
npx sequelize-cli model:generate --name Game --attributes gameType:string
npx sequelize-cli model:generate --name Table --attributes gameId:string
npx sequelize-cli model:generate --name UserTable --attributes tableId:string

npx sequelize-cli seed:generate --name user-seeds
npx sequelize-cli seed:generate --name game-seeds
npx sequelize-cli seed:generate --name table-seeds
