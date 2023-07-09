import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as gameActions from '../../redux/middleware/games';
import { showGamesAction, showTablesAction, leaveTableAction } from '../../redux/actions/gameActions';
import GameTile from '../GameTile';
import TableTile from '../TableTile';
import GameBarCard from '../GameBarCard';

import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';

import './ActiveGameBar.css'



const ActiveGameBar = () => {
  const { socket } = useContext(SocketContext);
  const location = useLocation();
  const dispatch = useDispatch();
  
  const user = useSelector(state => state.users.user);
  // const allGames = useSelector((state) => state.games.games);
  // const openTablesByGameType = useSelector((state) => state.games.openTablesByGameType);
  const currentTables = useSelector((state) => state.games.currentTables);
  
  // const showGames = useSelector((state) => state.games.showGames);
  // const showTables = useSelector((state) => state.games.showTables);
  const activeTable = useSelector((state) => state.games.activeTable);
  
  
  // const [actionHand, setActionHand] = useState(null);
  // const [needsNotification, setNeedsNotification] = useState(null);

  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);

  // useEffect(() => {
  //   if(activeTable && user && currentTables && currentTables?.[activeTable.id]?.tableUsers){
  //     let currActionHand = currentTables[activeTable.id]?.actionHand;
  //     setActionHand(currActionHand)
  //   }
  // }, [currentTables, activeTable]);



  const viewTable = (tableId) => {
    socket.emit('view_room', tableId);
  }
  const closeTable = (e,tableId) => {
    e.preventDefault()
    e.stopPropagation()

    let seatNumber = checkForSeat(tableId)
    if(seatNumber){
      setUpdateObj({seat:seatNumber, tableId:activeTable.id, type:'leaveTableViaTab'})
      openModal('leaveModal')
    }
    else {
      dispatch(leaveTableAction(tableId))
      // delete currentTables[tableId]
    }

  }
  
  const checkForSeat=(tableId)=>{
    let seat
    let hasSeat = Object.entries(currentTables[tableId].tableUsers).some(([seatId, seatData], index) => {
      if(seatData.userId === user.id){
        seat = seatId
        return true
      }
    })
    if(hasSeat){
      return seat
    }
    return false
  }



  return (
    <div className='gamebar-container flex'>
{Object.entries(currentTables).map(([tableId, tableData], index) => {
  let userCards;
  let handNeedsAttention = tableData.actionSeat === tableData.currentSeat
  // check if currentTables and current tableId exist
  if (currentTables && currentTables[tableId]?.tableUsers) {
    userCards = Object.values(currentTables[tableId]?.tableUsers).map(seat => {
      if (seat.userId === user.id) {
        return Object.values(seat.hands)[0]?.cards;
      }
      return null;
    }).flat();
  }


        // let userCards = currentTables[activeTable.id]?.tableUsers?.[seatNumber]?.cards; 
      return(
        <div onClick={()=>viewTable(tableId)} className={`gamebar-table-tab flex center ${handNeedsAttention ? ' active-tab' : ''}`} key={index}>
          <div onClick={
            (e)=>{

              closeTable(e,tableId)
            }} 
            className='gamebar-close-button'
            >
            x
          </div>
          <div className='wager-container flex center'>
          <div className='min-wager'>
            {tableData.Game.minBet}
          </div>
          <div>
          {tableData.Game.maxBet}
          </div>
          </div>
          {userCards &&( 
            <div className='card-container flex center'>
              {userCards.map((card,i)=>{
              return card !== undefined && 
              <div className='gamebar-card'>
                < GameBarCard key={i} card={card}/>
              </div>

              })}
            </div>
          )}

        </div>
      )

      }
    )}
      
      
      </div>
  )
}
export default ActiveGameBar