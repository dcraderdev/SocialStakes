const { gameController } = require('./controllers/gameController');


module.exports = function (io) {
  const rooms = {};
  const disconnectTimeouts = {};


  io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId;
    const username = socket.handshake.query.username;

    let socketId = socket.id;

    console.log('-=-=-=-=-=-=-=-=-=');
    console.log('--- CONNECTING ---');
    console.log('SOCKET ID', socketId);
    console.log('A user connected', socket.id, 'Username:', username);
    console.log('User Room:', userId);

    console.log('-=-=-=-=-=-=-=-=-=');



    socket.join(userId);

    const userTables = await gameController.getUserTables(userId);

    // Reconnection logic
    if (disconnectTimeouts[userId]) {
      clearTimeout(disconnectTimeouts[userId]);
      console.log(`User ${username} reconnected, timeout cleared.`);
      delete disconnectTimeouts[userId];


      if(userTables){
        for(table of userTables){
          let tableId = table.tableId
          let seat = table.seat
          let timer = 0
          let messageObj = {
            user: {
              username: 'Room',
              id: 1,
            },
            content: `${username} has reconnected.`,
            room: tableId,
          };
  
          io.in(tableId).emit('new_message', messageObj);
          io.in(tableId).emit('player_reconnected', {seat, tableId, timer});
        }
      }
    }
    


  socket.on('disconnect', async () => {
    let timer = 5000 // 15 seconds, adjust as needed
    console.log(`User ${username} disconnected`);
    const userTables = await gameController.getUserTables(userId);
    if(userTables){
      for(table of userTables){
        let tableId = table.tableId
        let seat = table.seat
        let messageObj = {
          user: {
            username: 'Room',
            id: 1,
          },
          content: `${username} has disconnected.`,
          room: tableId,
        };

        io.in(tableId).emit('new_message', messageObj);
        io.in(tableId).emit('player_disconnected', {seat, tableId, timer});
      }
    }

    // Clear the existing timeout for this user (if any)
    if (disconnectTimeouts[userId]) {
      clearTimeout(disconnectTimeouts[userId]);
    }


    // Start a new timeout for this user
    disconnectTimeouts[userId] = setTimeout(async () => {
      console.log('REMOVING PLAYER');
      if(userTables){

        for(table of userTables){
          let tableId = table.tableId
          let seat = table.seat
          io.in(tableId).emit('remove_player', {seat, tableId});
        }
      }
      await gameController.removeUserFromTables(userId);

    }, timer); 
    // isReconnecting[userId] = true;
  });

  


    socket.on('join_room', async (room) => {
      console.log('--- join_room ---');
      console.log(`${username} is joining room ${room}.`);
      let tableId = room

      let messageObj = {
        user: {
          username: 'Room',
          id: 1,
        },
        content: `${username} has joined the room.`,
        room,
      };


      // If the room doesnt exist create a new room
      if (!rooms[tableId]) {
        rooms[tableId] = { seats: { }, countdownTimer: 0, countdownRemaining: 0, handInProgress : false  };
      }

      let updateObj = {
        tableId,
        table: {
          seats: rooms[tableId].seats,
          countdownRemaining: rooms[tableId].countdownRemaining
        }
      };

      socket.join(room);
      socket.emit('get_updated_table', updateObj);
      io.in(room).emit('new_message', messageObj);
      

      console.log('-=-=-=-=-=-=-=-=-=');
    });

    socket.on('leave_room', (room) => {
      console.log('--- leave_room ---');
      console.log(`${username} is leaving room ${room}.`);
      console.log('-=-=-=-=-=-=-=-=-=');
      socket.leave(room);
    });

    // Broadcast message to specific room
    socket.on('message', async (messageObj) => {
      const { room, message } = messageObj;
      io.in(room).emit('new_message', messageObj);
      // io.in(userId).emit('message', messageObj);

      console.log('--------------');
      console.log(`Message received from ${room}`);
      console.log('--------------');
    });



    socket.on('take_seat', async (seatObj) => {
      const { room, seat, user, amount } = seatObj;
      let tableId = room

      let messageObj = {
        user: {
          username: 'Room',
          id: 1,
        },
        content: `${username} has taken seat ${seat}.`,
        room,
      };

      const takeSeat = await gameController.takeSeat(tableId, seat, user, amount)

      if(!takeSeat){
        return
      }

      takeSeat['username'] = user.username

      const takeSeatObj = {
        id: takeSeat.id,
        seat: takeSeat.seat,
        tableBalance: takeSeat.tableBalance,
        tableId:  takeSeat.tableId,
        userId:  takeSeat.userId,
        disconnectTimer:  takeSeat.disconnectTimer,
        pendingBet:  takeSeat.pendingBet,
        currentBet:  takeSeat.currentBet,

        username: user.username,
        cards: []
      }

      // Check if room already exists in rooms object, if not create one
      if (!rooms[tableId]) {
        rooms[tableId] = { seats: {}, countdownTimer: 0, countdownRemaining: 0, handInProgress : false   };
      }

      // Add the player to the room
      rooms[tableId].seats[seat] = takeSeatObj;


      console.log(rooms[tableId]);
      console.log(rooms[tableId].seats[seat]);


      console.log(takeSeatObj);

      // const newSeatObj = takeSeat.toJSON() 

      io.in(room).emit('new_message', messageObj);
      io.in(room).emit('new_player', takeSeatObj);

      // io.in(userId).emit('message', messageObj);

      console.log('--------------');
      console.log(`${username} taking seat${seat} in ${room}`);
      console.log('--------------');
    });

    socket.on('leave_seat', async (seatObj) => {
      
      const { room, seat, user, tableBalance } = seatObj;
      let tableId = room

      console.log('--------------');
      console.log(`leave_seat`);
      console.log(room);
      console.log('--------------');

      // Remove the player from the room state
      if(rooms[tableId] && rooms[tableId].seats[seat]){
        delete rooms[tableId].seats[seat];
      }

      // If the room is empty, delete the room
      if (rooms[tableId] && Object.keys(rooms[tableId].seats).length === 0) {
        delete rooms[tableId];
      }

      const leaveSeat = await gameController.leaveSeat(tableId, seat, user, tableBalance)

      if(!leaveSeat) return

      const leaveSeatObj = {
        seat,
        tableId,
        userId:user.id,
        tableBalance,
      }

      console.log(leaveSeatObj);
      io.in(room).emit('player_leave', leaveSeatObj);

    });


  


    socket.on('place_bet', async (betObj) => {

      const {bet, tableId, seat } = betObj
      let room = tableId

      // Check if room already exists in rooms object, if not create one
      if (!rooms[tableId]) {
        rooms[tableId] = { seats: {}, countdownTimer: 0, countdownRemaining: 0, handInProgress : false  };
      }

      // Update pendingBet in the rooms object


      console.log();



      if (rooms[tableId] && rooms[tableId].seats[seat]) {
        console.log('yes');
        console.log('yes');
        console.log('yes');
        console.log('yes');
        console.log('yes');
        rooms[tableId].seats[seat].pendingBet += bet;
        rooms[tableId].seats[seat].tableBalance -= bet;

        console.log(rooms[tableId].seats[seat].pendingBet);
        console.log(rooms[tableId].seats[seat].tableBalance);

      }


      console.log(rooms);
      console.log(rooms[tableId]);

      // Countdown duration
      const countdownDuration = 5000; // 5 seconds

      // Start a new countdown
      let countdownRemaining = countdownDuration;


      // Start a new countdown if one isn't already running
      if (!rooms[tableId].countdownTimer) {
        let countdownObj = {
          countdownRemaining,
          tableId
        }

        io.in(room).emit('countdown_update', countdownObj);

        rooms[tableId].countdownTimer = setInterval(() => {
          countdownRemaining -= 1000;
          rooms[tableId].countdownRemaining = countdownRemaining;
          if (countdownRemaining <= 0) {
            clearInterval(rooms[tableId].countdownTimer);
            rooms[tableId].countdownTimer = null;
            rooms[tableId].countdownRemaining = 0;
            rooms[tableId].handInProgress = true;
            // Countdown finished, emit event to collect all bets
            io.in(room).emit('collect_bets');
          } 
        }, 1000); 
      }


      io.in(room).emit('new_bet', betObj);

      console.log('--------------');
      console.log(`Bet(${bet}) received from ${username} @room ${room}`);
      console.log('--------------');
    });



    socket.on('remove_last_bet', async (betObj) => {
      const { tableId, seat, lastBet } = betObj
      let room = tableId

      // Update pendingBet in the rooms object
      if (rooms[tableId] && rooms[tableId].seats[seat]) {
        rooms[tableId].seats[seat].pendingBet -= lastBet;
        rooms[tableId].seats[seat].tableBalance += lastBet;

      }

      io.in(room).emit('remove_last_bet', betObj);

      console.log('--------------');
      console.log(`Removing last bet(${lastBet}) received from ${username} @room ${room}`);
      console.log('--------------');
    });





    socket.on('remove_all_bet', async (betObj) => {
      const { tableId, seat, lastBet } = betObj
      let room = tableId

      // Update pendingBet in the rooms object
      if (rooms[tableId] && rooms[tableId].seats[seat]) {
        let pendingBet = rooms[tableId].seats[seat].pendingBet
        rooms[tableId].seats[seat].tableBalance += pendingBet;
        rooms[tableId].seats[seat].pendingBet = 0;  
      }

      io.in(room).emit('remove_all_bet', betObj);

      console.log('--------------');
      console.log(`Removing all bets received from ${username} @room ${room}`);
      console.log('--------------');
    });






    socket.on('add_funds', async (seatObj) => {
      const {tableId, seat, userId, amount } = seatObj
      let room = tableId


      const addFunds = await gameController.addFunds(seatObj)

      if(!addFunds){
        return
      }

      
      if(addFunds){
        if (rooms[tableId] && rooms[tableId].seats[seat]) {
          rooms[tableId].seats[seat].tableBalance += amount;
        }
        io.in(room).emit('player_add_table_funds', seatObj);
      }


      // io.in(userId).emit('message', messageObj);

      console.log('--------------');
      console.log(`Adding funds(${amount}) for ${username} @room ${room}`);
      console.log('--------------');
    });


  });
};
