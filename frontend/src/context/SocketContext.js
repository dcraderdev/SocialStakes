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
      


  

      socket.on('message', (messageObj) => {
        console.log('receiving message');
        console.log(messageObj.conversationId);
        console.log(messageObj);
  
        dispatch(addMessage(messageObj));

      });

    


      return () => {
        socket.off('message');
        socket.off('initialize_messages');

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
 

