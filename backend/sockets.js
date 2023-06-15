

module.exports = function (io) {
  const rooms = {};

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    const username = socket.handshake.query.username;
    const userRoom = socket.handshake.query.userRoom;

    let socketId = socket.id;

    console.log('-=-=-=-=-=-=-=-=-=');
    console.log('--- CONNECTING ---');
    console.log('SOCKET ID', socketId);
    console.log('A user connected', socket.id, 'User ID:', username);
    console.log('-=-=-=-=-=-=-=-=-=');

    socket.join(userRoom);

    socket.on('initialize_messages', async () => {
      console.log('INITIALIZING');
      console.log('INITIALIZING');

        let conversations = await chatController.getConversations(userId);
        if (conversations) socket.emit('initialize_messages', conversations);
      

    });



    socket.on('join_room', async (room) => {
      socket.join(room);
      console.log(`${username} is attempting to join room ${room}.`);
    });
 

    socket.on('leave_chat', (chatRoom) => {
      let room = chatRoom.conversationId
      let convoObj = {}
      convoObj.room = room
      convoObj.userId = userId

      console.log(`${username} is leaving room ${room}.`);
      socket.leave(room);
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
