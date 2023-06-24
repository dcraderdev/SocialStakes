const { gameController } = require('./controllers/gameController');


module.exports = function (io) {
  const rooms = {};

  io.on('connection', (socket) => {
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

    socket.on('initialize', async () => {
      console.log('INITIALIZING');
      console.log('INITIALIZING');

      // Load table images
    });

    socket.on('join_room', async (room) => {
      console.log('--- join_room ---');
      console.log(`${username} is joining room ${room}.`);

      let messageObj = {
        user: {
          username: 'Room',
          id: 1,
        },
        content: `${username} has joined the room.`,
        room,
      };
      socket.join(room);

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
        console.log('yeee');
        return
      }

      console.log('-=-=--=-=-');
      console.log('-=-=--=-=-');
      console.log(takeSeat);
      console.log('-=-=--=-=-');
      console.log('-=-=--=-=-');

      takeSeat['username'] = user.username

      let goal = {
        id: "e87a6a96-6ebc-4ef3-b6a1-3058b136fbbb",
        seat: 2,
        tableBalance: 50,
        tableId: "e10d8de4-f4c2-4d28-9324-56aa9c920801",
        userId: "87d1cb3a-b8e2-4c7e-9d80-462a523b0fcb",
        username: "Hazel"
      }



      const takeSeatObj = {
        id: takeSeat.id,
        seat: takeSeat.seat,
        tableBalance: takeSeat.tableBalance,
        tableId:  takeSeat.tableId,
        userId:  takeSeat.userId,
        username: user.username
      }

      console.log(takeSeatObj);

      // const newSeatObj = takeSeat.toJSON() 

      io.in(room).emit('new_message', messageObj);
      io.in(room).emit('new_player', takeSeatObj);


      // io.in(userId).emit('message', messageObj);

      console.log('--------------');
      console.log(`Message received from ${room}`);
      console.log('--------------');
    });
  });
};
