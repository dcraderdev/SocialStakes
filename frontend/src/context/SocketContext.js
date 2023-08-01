import React, { createContext, useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import { ModalContext } from './ModalContext';
import * as gameActions from '../redux/middleware/games';

import {
  addMessageAction,
  editMessageAction,
  deleteMessageAction,
  getUserConversationsAction,
  addConversationAction,
  removeConversationAction
  } from '../redux/actions/chatActions';


import {
  updateTableAction, updateTableNameAction,
  deleteTableAction,
  takeSeatAction, leaveSeatAction, playerForfeitAction,
  addBetAction, removeLastBetAction, removeAllBetAction,
  playerDisconnectAction, playerReconnectAction,
  removePlayerAction,
  playerAddTableFundsAction,
  updateTableCountdownAction,
  collectBetsAction,
  viewTableAction,
  offerInsuranceAction, rescindInsuranceAction,
  joinTableAction, leaveTableAction
} from '../redux/actions/gameActions';


import {
  addOutGoingFriendRequest,
  addIncomingFriendRequest,
  acceptFriendRequest,
  denyFriendRequest,
  removeFriendAction,
  getUserFriendsAction
} from '../redux/actions/friendActions';




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
      
      socket.on('initialize_user', (initObj) => {
        dispatch(getUserFriendsAction(initObj.userFriends));
        dispatch(getUserConversationsAction(initObj.userConversations));
      }); 


      socket.on('view_table', (tableId) => {
        dispatch(viewTableAction(tableId));
      }); 

      socket.on('join_table', (table) => {
        dispatch(joinTableAction(table));
      }); 

      socket.on('close_table', (tableId) => {
        openModal('tableClosedModal')
        dispatch(leaveTableAction(tableId));
      }); 

      socket.on('leave_table', (tableId) => {
        dispatch(leaveTableAction(tableId));
      }); 

      socket.on('update_table_name', (updateObject) => {
        dispatch(updateTableNameAction(updateObject));
      }); 

      socket.on('get_updated_table', (updateObject) => {

        // console.log('_+_+_+_+_+_+_+_+_+_+_+');
        // console.log('_+_+_+_+_+_+_+_+_+_+_+');
        // console.log(updateObject);
        // console.log('_+_+_+_+_+_+_+_+_+_+_+');
        // console.log('_+_+_+_+_+_+_+_+_+_+_+');
        // console.log('_+_+_+_+_+_+_+_+_+_+_+');

        if(updateObject.resetRoomForNextHand){
          // console.log('resetRoomForNextHand');
          // console.log('resetRoomForNextHand');
          // console.log('resetRoomForNextHand');
          // console.log('resetRoomForNextHand');
          // console.log('resetRoomForNextHand');
        }
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
        dispatch(takeSeatAction(seatObj));
      });    

      socket.on('player_leave', (seatObj) => {
        dispatch(leaveSeatAction(seatObj)); 
      });   

      socket.on('player_forfeit', (leaveSeatObj) => {
        dispatch(playerForfeitAction(leaveSeatObj)); 
      }); 


      socket.on('new_bet', (betObj) => {
        dispatch(addBetAction(betObj)); 
      });  

      socket.on('remove_last_bet', (betObj) => {
        dispatch(removeLastBetAction(betObj)); 
      });  
      socket.on('remove_all_bet', (betObj) => {
        dispatch(removeAllBetAction(betObj)); 
      });  
 

      socket.on('offer_insurance', (tableId) => {
        dispatch(offerInsuranceAction(tableId)); 
      });  
 
      socket.on('remove_insurance_offer', (tableId) => {
        dispatch(rescindInsuranceAction(tableId)); 
      }); 


      socket.on('player_disconnected', ({seat, tableId, timer}) => {
        dispatch(playerDisconnectAction({seat, tableId, timer})); 
      });  

      socket.on('player_reconnected', ({seat, tableId, timer}) => {
        dispatch(playerReconnectAction({seat, tableId, timer})); 
      });  

      // socket.on('remove_player', (leaveSeatObj) => {
      //   dispatch(removePlayerAction(leaveSeatObj)); 
      // });  

      socket.on('player_add_table_funds', (seatObj) => {
        dispatch(playerAddTableFundsAction(seatObj)); 
      });  

      socket.on('countdown_update', (countdownObj) => {
        console.log(countdownObj);
        dispatch(updateTableCountdownAction(countdownObj)); 
      });  

      socket.on('collect_bets', (countdownObj) => {
        let tableId = countdownObj.tableId
        dispatch(collectBetsAction(countdownObj)); 
      });  




    // friends
    socket.on('friend_request_sent', (friendRequestObj) => {
      dispatch(addOutGoingFriendRequest(friendRequestObj));
    });

    // // 
    socket.on('friend_request_received', (friendRequestObj) => {
      dispatch(addIncomingFriendRequest(friendRequestObj));
    });
    

    socket.on('accept_friend_request', (friendRequestObj) => {
      dispatch(acceptFriendRequest(friendRequestObj));
    });

    // // 
    socket.on('deny_friend_request', (friendRequestObj) => {
      console.log(friendRequestObj);
      dispatch(denyFriendRequest(friendRequestObj));
    });

    // // 
    socket.on('friend_removed', (friendObj) => {
      dispatch(removeFriendAction(friendObj));
      dispatch(removeConversationAction(friendObj));
    });

    // // 
    socket.on('add_conversation', (convoObj) => {
      dispatch(addConversationAction(convoObj));
    });

    // // 
    socket.on('remove_conversation', (friendObj) => {
      dispatch(removeFriendAction(friendObj));
    });




      return () => {
        
        socket.off('initialize_user');
        socket.off('player_forfeit');
        socket.off('view_table');
        socket.off('join_table');
        socket.off('close_table');
        socket.off('leave_table');
        socket.off('update_table_name');
        socket.off('get_updated_table');
        socket.off('new_message');
        socket.off('edit_message');
        socket.off('delete_message');
        socket.off('new_player');
        socket.off('player_leave');
        socket.off('new_bet');
        socket.off('remove_last_bet');
        socket.off('remove_all_bet');
        socket.off('offer_insurance');
        socket.off('remove_insurance_offer');
        socket.off('player_disconnected');
        socket.off('player_reconnected');
        socket.off('player_add_table_funds');
        // socket.off('remove_player');
        socket.off('countdown_update');
        socket.off('collect_bets');
        socket.off('friend_request_sent');
        socket.off('friend_request_received');
        socket.off('accept_friend_request');
        socket.off('deny_friend_request');
        socket.off('friend_removed');

        socket.off('add_conversation');
        socket.off('remove_conversation');

        
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
 

