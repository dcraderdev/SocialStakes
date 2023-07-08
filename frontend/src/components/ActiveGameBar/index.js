import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as gameActions from '../../redux/middleware/games';
import { showGamesAction, showTablesAction } from '../../redux/actions/gameActions';
import GameTile from '../GameTile';
import TableTile from '../TableTile';
import GameBarCard from '../GameBarCard';

import { SocketContext } from '../../context/SocketContext';

import './ActiveGameBar.css'



const ActiveGameBar = () => {
  const { socket } = useContext(SocketContext);
  const location = useLocation();
  const dispatch = useDispatch();
  
  const user = useSelector(state => state.users.user);
  const allGames = useSelector((state) => state.games.games);
  const openTablesByGameType = useSelector((state) => state.games.openTablesByGameType);
  const currentTables = useSelector((state) => state.games.currentTables);
  
  const showGames = useSelector((state) => state.games.showGames);
  const showTables = useSelector((state) => state.games.showTables);
  const activeTable = useSelector((state) => state.games.activeTable);
  
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [tables, setTables] = useState({});


  const [actionHand, setActionHand] = useState(null);
  const [needsNotification, setNeedsNotification] = useState(null);

  useEffect(() => {
    if(activeTable && user && currentTables && currentTables?.[activeTable.id]?.tableUsers){
      let currActionHand = currentTables[activeTable.id]?.actionHand;
      setActionHand(currActionHand)
    }
  }, [currentTables, activeTable]);


console.log(actionHand);



  const viewTable = (tableId) => {
    socket.emit('view_room', tableId);
  }
  const closeTable = (e,tableId) => {
    e.preventDefault()
    e.stopPropagation()
    socket.emit('view_room', tableId);
  }



  return (
    <div className='gamebar-container flex'>
{Object.entries(currentTables).map(([tableId, tableData], index) => {
  console.log(tableData);
  let userCards;
  let handNeedsAttention = tableData.actionSeat === tableData.currentSeat
  console.log(tableData.Game.minBet);
  
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