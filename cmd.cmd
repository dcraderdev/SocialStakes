npx sequelize-cli model:generate --name User --attributes username:string
npx sequelize-cli model:generate --name Game --attributes gameType:string
npx sequelize-cli model:generate --name Table --attributes gameId:string
npx sequelize-cli model:generate --name UserTable --attributes tableId:string
npx sequelize-cli model:generate --name Round --attributes tableId:string
npx sequelize-cli model:generate --name Hand --attributes roundId:integer
npx sequelize-cli model:generate --name ServerSeed --attributes serverSeed:string
npx sequelize-cli model:generate --name GameSession --attributes userId:string
npx sequelize-cli model:generate --name Action --attributes userId:string
npx sequelize-cli model:generate --name Friendship --attributes userId:string
npx sequelize-cli model:generate --name Pot --attributes userId:string
npx sequelize-cli model:generate --name UserPot --attributes userId:string
npx sequelize-cli model:generate --name Message --attributes userId:string
npx sequelize-cli model:generate --name Theme --attributes url:string

npx sequelize-cli seed:generate --name user-seeds
npx sequelize-cli seed:generate --name game-seeds
npx sequelize-cli seed:generate --name table-seeds
npx sequelize-cli seed:generate --name game-session-seeds
npx sequelize-cli seed:generate --name user-table-seeds
npx sequelize-cli seed:generate --name round-seeds
npx sequelize-cli seed:generate --name hand-seeds
npx sequelize-cli seed:generate --name server-seed-seeds
npx sequelize-cli seed:generate --name friendship-seeds
npx sequelize-cli seed:generate --name pot-seeds
npx sequelize-cli seed:generate --name user-pot-seeds
npx sequelize-cli seed:generate --name action-seeds
npx sequelize-cli seed:generate --name static-server-seeds
npx sequelize-cli seed:generate --name simulated-action-seeds
npx sequelize-cli seed:generate --name theme-seeds


