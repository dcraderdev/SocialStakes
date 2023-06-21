

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
      socket.join(room);
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

      let room = messageObj.conversationId;
      messageObj.conversation = conversation

      if(conversation){
        io.in(room).emit('message', messageObj);
      }


      console.log('--------------');
      console.log(`Message received from ${messageObj.sender.username}: ${messageObj.content} `);
      console.log(`@ Room ${messageObj.conversationId}`);
      console.log('--------------');
    });




  });
};
