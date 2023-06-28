import React, { createContext, useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';

import * as gameActions from '../redux/middleware/games';
import {takeSeatAction, leaveSeatAction, addBetAction, removeLastBetAction, removeAllBetAction, playerDisconnectAction, playerReconnectAction, removePlayerAction} from '../redux/actions/gameActions';


const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const dispatch = useDispatch()
  
  const [socket, setSocket] = useState(null);
  
  const user = useSelector((state) => state.users.user);

  useEffect(() => {
    if(!user){
      return
    }
    let userId = user.id
    let username = user.username

    const backendUrl = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_BACKEND_PROD_URL : 'http://localhost:8000';
    const socketConnection = io(backendUrl, {
      query: { userId, username },
    });


    
    setSocket(socketConnection);
    


    return () => {
      
      socketConnection.disconnect();
    };
  }, [user]); 

  console.log(socket);



  useEffect(() => {
    if(socket){
      
      if(user){
        socket.emit('initialize_messages');
      }
      

      socket.on('new_message', (messageObj) => {
        dispatch(gameActions.addMessage(messageObj));
      });

      socket.on('new_player', (seatObj) => {
        console.log(seatObj);
        dispatch(takeSeatAction(seatObj));
      });    

      socket.on('player_leave', (seatObj) => {
        console.log(seatObj);
        dispatch(leaveSeatAction(seatObj)); 
      });   




      socket.on('new_bet', (betObj) => {
        console.log(betObj);
        dispatch(addBetAction(betObj)); 
      });  

      socket.on('remove_last_bet', (betObj) => {
        console.log(betObj);
        dispatch(removeLastBetAction(betObj)); 
      });  
      socket.on('remove_all_bet', (betObj) => {
        console.log(betObj);
        dispatch(removeAllBetAction(betObj)); 
      });  





      socket.on('player_disconnected', ({seat, tableId, timer}) => {
        console.log('player_disconnected');
      
        console.log(seat);
        console.log(tableId);
        console.log(timer);
        dispatch(playerDisconnectAction({seat, tableId, timer})); 
      });  

      socket.on('player_reconnected', ({seat, tableId, timer}) => {
        console.log('player_reconnected');
      
        console.log(seat);
        console.log(tableId);
        console.log(timer);
        dispatch(playerReconnectAction({seat, tableId, timer})); 
      });  

      socket.on('remove_player', ({seat, tableId}) => {
        console.log('remove_player');
        dispatch(removePlayerAction({seat, tableId})); 
      });  

      socket.on('player_add_table_funds', (seatObj) => {
        console.log('player_add_table_funds');
        dispatch(playerAddTableFunds(seatObj)); 
      });  


      return () => {

        socket.off('new_message');
        socket.off('new_player');
        socket.off('player_leave');
        socket.off('new_bet');
        socket.off('player_disconnected');
        socket.off('player_reconnected');
        socket.off('player_add_funds');
        socket.off('remove_player');


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
 

