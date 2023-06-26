import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as gameActions from '../../redux/middleware/games';
import { showGamesAction, showTablesAction } from '../../redux/actions/gameActions';
import GameTile from '../GameTile';
import TableTile from '../TableTile';

import { SocketContext } from '../../context/SocketContext';


import './GameFloor.css';
import Game from '../Game';

function GameFloor() {
  
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

  


  // handle loading active games on component load
  useEffect(() => {
    dispatch(gameActions.getAllGames())
  }, []);


  // handle checking active games
  useEffect(() => {
    setIsLoaded(false);
    if(Object.values(allGames).length > 0){
      setIsLoaded(true)
    }
  }, [allGames]);


  const goBack = () =>{
    console.log('goBack');
    dispatch(showGamesAction())
  }



  const checkTables = (gameType) =>{
    dispatch(gameActions.getTablesByType(gameType))
  }



  const viewTable = (table) =>{
    console.log('viewing table');
      //join table's socket
      if(user){ 
        socket.emit('join_room', table.id);
      }
      dispatch(gameActions.viewTable(table.id))
  }



//   const leaveTable = (table) =>{
//     console.log('leaving table');
//     //join table's socket
//     socket.emit('leave_room', table.id);
//     dispatch(gameActions.leaveTable(table))
// }


  
  // // Take/change seat
  // const takeSeat = (seat) =>{
  //   console.log('joining table');
  //   let tableId = activeTable?.id
  //   dispatch(gameActions.takeSeat(tableId, seat))
  //   // then show seat taken, emit to socket
  // }

  const leaveSeat = (table) =>{
    console.log('leaving seat');
    dispatch(gameActions.leaveSeat(table.id))
    leaveTable(table)
  }

  const startPrivateGame = () =>{

  }

  const joinPrivateGame = () =>{

  }

  console.log(activeTable);


  return ( 
    <>
      <div className={`gamefloor-wrapper ${activeTable ? 'table-view' : ''}`}>     
        <div className='gamefloor-container'>
          <div className='gamefloor-content'>

          {!activeTable && (
            <div>
            <div className='private-game-buttons'>
              <div className='private-game-button' onClick={startPrivateGame}>Start Private Game</div>
              <div className='private-game-button' onClick={joinPrivateGame}>Join Private Game</div>
            </div>
            <div className='gamefloor-back-button-container'>
              <div className='gamefloor-back-button flex center' onClick={goBack}>
                <i className="fa-solid fa-arrow-left-long"></i>
              </div>
            </div>

            </div>
          )}


            {!isLoaded && (
              <div className="games-grid">
                <div className='game-tile'>
                  <p>{'whaaaaaa'}</p>
                </div>
                <div className='game-tile'>
                  <p>{'aaaaaa'}</p>
                </div>
                <div className='game-tile'>
                  <p>{'aaaaaaat'}</p>
                </div>
              </div>
            )}


{/* SHOW GAMES AND PRIVATE TABLE BUTTONS */}
                {isLoaded && showGames && (
                      <div className="games-grid">
                        {allGames && Object.values(allGames).map((game, index) => (
                          <GameTile key={index} game={game} checkTables={checkTables}/>
                        ))}
                      </div>
                )}



{/* SHOW AVAILABLE TABLES PER GAME TYPE */}
                {isLoaded && showTables && (
                      <div className="available-tables-grid">
                        {openTablesByGameType && openTablesByGameType.map((table, index) => (
                          <TableTile key={index} table={table} viewTable={viewTable}/>
                        ))}
                      </div>
                )}



{/* SHOW SELECTED TABLE */}
                {isLoaded && activeTable && (
                  <div className='game-view'>
                    {activeTable &&  (
                      <Game />
                    )}
                  </div>
                )}







          </div>
          
        </div>
      </div>
    </>
  );

}

export default GameFloor;
