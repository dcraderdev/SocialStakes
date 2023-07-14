import React, { createContext, useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import { ModalContext } from './ModalContext';
import * as gameActions from '../redux/middleware/games';

import {addMessageAction, editMessageAction,deleteMessageAction} from '../redux/actions/chatActions';



import {
  updateTableAction,
  updateTableNameAction,
  deleteTableAction,
  takeSeatAction, leaveSeatAction, forfeitSeatAction,
  addBetAction, removeLastBetAction, removeAllBetAction,
  playerDisconnectAction, playerReconnectAction,
  removePlayerAction,
  playerAddTableFundsAction,
  updateTableCountdownAction,
  collectBetsAction,
  viewTableAction,
  offerInsuranceAction, 
  rescindInsuranceAction,
  joinTableAction
} from '../redux/actions/gameActions';


const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const dispatch = useDispatch()
  
  const [socket, setSocket] = useState(null);
  const { openModal, updateObj, setUpdateObj} = useContext(ModalContext);
  
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




  useEffect(() => {
    if(socket){
      
      socket.on('view_table', (tableId) => {
        dispatch(viewTableAction(tableId));
      }); 

      socket.on('join_table', (table) => {
        dispatch(joinTableAction(table));
      }); 

      socket.on('close_table', (leaveSeatObj) => {
        const { tableId } = leaveSeatObj
        openModal('tableClosedModal')
        dispatch(deleteTableAction(tableId));
        dispatch(leaveSeatAction(leaveSeatObj)); 
      }); 


      socket.on('update_table_name', (updateObject) => {
        dispatch(updateTableNameAction(updateObject));
      }); 

      socket.on('get_updated_table', (updateObject) => {
        dispatch(updateTableAction(updateObject)); 
      }); 
      

      socket.on('new_message', (messageObj) => {
        dispatch(addMessageAction(messageObj));
      });

      socket.on('edit_message', (messageObj) => {
        dispatch(editMessageAction(messageObj));
      })

      socket.on('delete_message', (messageObj) => {
        dispatch(deleteMessageAction(messageObj));
      })

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
 

      socket.on('offer_insurance', (tableId) => {
        console.log('offer_insurance');
        dispatch(offerInsuranceAction(tableId)); 
      });  

      socket.on('remove_insurance_offer', (tableId) => {
        dispatch(rescindInsuranceAction(tableId)); 
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
      });  

      return () => {
        
        socket.off('view_table');
        socket.off('join_table');
        socket.off('close_table');
        socket.off('update_table_name');
        socket.off('get_updated_table');
        socket.off('new_message');
        socket.off('edit_message');
        socket.off('delete_message');
        socket.off('new_player');
        socket.off('player_leave');
        socket.off('player_forfeit');
        socket.off('new_bet');
        socket.off('remove_last_bet');
        socket.off('remove_all_bet');
        socket.off('offer_insurance');
        socket.off('remove_insurance_offer');
        socket.off('player_disconnected');
        socket.off('player_reconnected');
        socket.off('player_add_table_funds');
        socket.off('remove_player');
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
 

