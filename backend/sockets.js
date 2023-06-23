

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

      let messageObj = {user: {username: 'Room', id: 1}, content:`${username} has joined the room.`, room}
      socket.join(room);

      io.in(room).emit('new_message', messageObj);

      console.log('-=-=-=-=-=-=-=-=-=');
    });
 

    socket.on('leave_room', (room) => {
      console.log('--- leave_room ---');
      console.log(`${username} is leaving room ${room}.`);
      socket.leave(room);
      console.log('-=-=-=-=-=-=-=-=-=');
    });



    // Broadcast message to specific room
    socket.on('message', async (messageObj) => {
      const {room, message} = messageObj
      io.in(room).emit('new_message', messageObj);
      // io.in(userId).emit('message', messageObj);


      console.log('--------------');
      console.log(`Message received from ${room}`);
      console.log('--------------');
    });




  });
};
