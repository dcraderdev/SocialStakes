import React, { createContext, useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';

import * as gameActions from '../redux/middleware/games';
import {
  updateTableAction,
  takeSeatAction, leaveSeatAction, forfeitSeatAction,
  addBetAction, removeLastBetAction, removeAllBetAction,
  playerDisconnectAction, playerReconnectAction,
  removePlayerAction,
  playerAddTableFundsAction,
  updateTableCountdownAction,
  collectBetsAction,
  viewTableAction
} from '../redux/actions/gameActions';


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
      
      socket.on('view_table', (table) => {
        dispatch(viewTableAction(table));
      }); 

      socket.on('get_updated_table', (updateObj) => {


        console.log('-=-=-=-=-=');
        console.log('-=-=-=-=-=');
        console.log('-=-=-=-=-=');
        console.log('-=-=-=-=-=');
        console.log(updateObj);
        console.log('-=-=-=-=-=');
        console.log('-=-=-=-=-=');
        console.log('-=-=-=-=-=');
        console.log('-=-=-=-=-=');




        dispatch(updateTableAction(updateObj)); 
      }); 
      

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


      socket.on('player_forfeit', (leaveSeatObj) => {
        console.log(leaveSeatObj);
        dispatch(forfeitSeatAction(leaveSeatObj)); 
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

      socket.on('remove_player', (leaveSeatObj) => {
        console.log('remove_player');
        dispatch(removePlayerAction(leaveSeatObj)); 
      });  

      socket.on('player_add_table_funds', (seatObj) => {
        console.log('player_add_table_funds');
        dispatch(playerAddTableFundsAction(seatObj)); 
      });  

      socket.on('countdown_update', (countdownObj) => {
        console.log('countdown_update'); 
        dispatch(updateTableCountdownAction(countdownObj)); 
      });  

      socket.on('collect_bets', (countdownObj) => {
        console.log('collect_bets'); 
        console.log(countdownObj);
        let tableId = countdownObj.tableId
        dispatch(collectBetsAction(countdownObj)); 
        // socket.emit('deal_cards', tableId)
      });  

      return () => {

        socket.off('view_table');
        socket.off('new_message');
        socket.off('new_player');
        socket.off('player_leave');
        socket.off('player_forfeit');
        socket.off('new_bet');
        socket.off('player_disconnected');
        socket.off('player_reconnected');
        socket.off('player_add_table_funds');
        socket.off('remove_player');
        socket.off('get_updated_table');
        socket.off('countdown_update');
        socket.off('collect_bets');

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
 

