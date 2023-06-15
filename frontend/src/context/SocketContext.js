import React, { createContext, useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';

const SocketContext = createContext();


const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const user = useSelector((state) => state.users.user);

  const dispatch = useDispatch()
 
  console.log(user);


  useEffect(() => {
    let userId = user ? `${user.id}` : 'null';
    let userRoom = user ? `${user.userRoom}` : 'null';
    let username = user ? `${user.username}` : 'Anon';

    const backendUrl = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_BACKEND_PROD_URL : 'http://localhost:8000';
    const socketConnection = io(backendUrl, {
      query: { userId, userRoom, username },
    });

    setSocket(socketConnection);


    return () => {
      
      socketConnection.disconnect();
    };
  }, [user]); 

  


  useEffect(() => {
    if(socket){
      
      if(user){
        socket.emit('initialize_messages');
      }
      

      socket.on('initialize_messages', (conversations) => {

        let userRoom = user ? user.userRoom : '42'
        let roomsToJoin = [userRoom]
        let roomTabs = []
        let generalChat = {}


        if (conversations) {

          Object.values(conversations).map(convo=>{

            console.log(convo);

            // if(!convo.conversationId) {
            //   continue
            // }

            
            if(convo.conversationId){
              roomsToJoin.push(convo.conversationId)
              
              if(convo.tabName !== 'General'){
                roomTabs.push({
                  conversationId: convo.conversationId,
                  tabName: convo.tabName
                })
              }

            }


            if(convo.tabName === 'General'){
                generalChat = {
                  conversationId: convo.conversationId,
                  tabName: convo.tabName
                }
              }
            
          })   
        socket.emit('initialize_rooms', roomsToJoin);

        }

        conversations.generalChat = generalChat
        conversations.chatRoom = generalChat
        conversations.chatRoomTabs = roomTabs
        conversations.hiddenTabNotification = false

        console.log(conversations.chatRoomTabs);

        dispatch(initialLoadConversations(conversations)) 
      }); 

      


      socket.on('message', (messageObj) => {
        console.log('receiving message');
        console.log(messageObj.conversationId);
        console.log(messageObj);
  
        dispatch(addMessage(messageObj));

      });

      socket.on('set_tab_name', (newTabNameObj) => {
        console.log('SETTING NEW TAB NAME');
        console.log('SETTING NEW TAB NAME');
        console.log('SETTING NEW TAB NAME');
  
        console.log(newTabNameObj);

        dispatch(setChatRoomName(newTabNameObj));
        
      });



  // // Handle new Conversation
    socket.on('new_convo', (conversation) => {

      dispatch(addConversation(conversation));
      dispatch(setChatRoom(conversation));
    });


    // // Handle new Conversation
    socket.on('convo_invite', (conversation) => {
      console.log('NEW CONVERSATION INVITE');

      // console.log(conversation);
      dispatch(addConversationInvite(conversation));
    });

    // // 
    socket.on('friend_request_sent', (friendRequestObj) => {
      dispatch(addOutGoingFriendRequest(friendRequestObj));
    });

    // // 
    socket.on('friend_request_received', (friendRequestObj) => {
      console.log('here');
      dispatch(addIncomingFriendRequest(friendRequestObj));
    });
    

    socket.on('accept_friend_request', (friendRequestObj) => {
      console.log(friendRequestObj);
      dispatch(acceptFriendRequest(friendRequestObj));
    });

    // // 
    socket.on('deny_friend_request', (friendRequestObj) => {
      console.log(friendRequestObj);
      dispatch(denyFriendRequest(friendRequestObj));
    });




      return () => {
        socket.off('message');
        socket.off('initialize_messages');
        socket.off('new_conversation');
        socket.off('new_conversation_invite');
        socket.off('set_tab_name');
        socket.off('friend_request_sent');
        socket.off('friend_request_received');
        socket.off('accept_friend_request');
        socket.off('deny_friend_request');


      };
      
    }
  }, [socket]);



  return (
    <SocketContext.Provider value={{socket}}>
      {children}
    </SocketContext.Provider>
  );
};



export { SocketContext, SocketProvider };
 

