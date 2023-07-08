import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as gameActions from '../../redux/middleware/games';
import { showGamesAction, showTablesAction } from '../../redux/actions/gameActions';
import GameTile from '../GameTile';
import TableTile from '../TableTile';
import Card from '../Card';

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


  console.log(currentTables);

  useEffect(()=>{
    if(currentTables){
      setTables
    }

  },[currentTables, activeTable])

  const viewTable = (tableId) => {
    socket.emit('view_room', tableId);
  }
  



  return (
    <div className='flex'>
{Object.entries(currentTables).map(([tableId, tableData], index) => {
  let userCards;
  
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
        <div onClick={()=>viewTable(tableId)} className='gamebar-table-tab flex' key={index}>
          {userCards &&( 
          <div className='card-container'>
            {userCards.map((card,i)=>{
              console.log(card);
             return card && <Card key={i} card={card}/>
            })}
            </div>)
            }
          {/* {tableId} */}

        </div>
      )

      }
    )}
      
      
      </div>
  )
}
export default ActiveGameBar