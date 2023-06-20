import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as gameActions from '../../redux/middleware/games';
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
  // const showActiveTable = useSelector((state) => state.games.showActiveTable);

  const activeTable = useSelector((state) => state.games.activeTable);





  const [isLoaded, setIsLoaded] = useState(false);

  const [games, setGames] = useState({});
  const [tables, setTables] = useState({});
  // const [activeTable, setActiveTable] = useState(null);

  // const [showGames, setShowGames] = useState(true);
  // const [showTables, setShowTables] = useState(false);
  // const [showActiveTable, setShowActiveTable] = useState(false);

  
  
  
console.log(openTablesByGameType);
console.log(games);
console.log(activeTable);


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



  // // handle checking active tables
  // useEffect(() => {
  //   setIsLoaded(false);
  //   if(openTablesByGameType.length > 0){
  //     setGames(openTablesByGameType)
  //     setShowTables(true)
  //     setShowGames(false)
  //     setIsLoaded(true)
  //   }
  // }, [openTablesByGameType]);



  // // handle active table change
  // useEffect(() => {
  //   if(activeTable){
  //     setShowTables(false)
  //     setShowGames(false)
  //     setShowActiveTable(true)
  //   }
  // }, [activeTable]);




  const goBack = () =>{
    console.log('goBack');
    setShowGames(true)
    setShowTables(false)
    if(Object.values(allGames).length > 0){
      setIsLoaded(true)
    }
  }



  const checkTables = (gameType) =>{
    dispatch(gameActions.getTablesByType(gameType))
  }



  const viewTable = (table) =>{
    console.log('viewing table');
      //join table's socket
      socket.emit('join_room', table.id);
      dispatch(gameActions.viewTable(table.id))
  }



  const leaveTable = (table) =>{
    console.log('leaving table');
    //join table's socket
    socket.emit('leave_room', table.id);
    dispatch(gameActions.leaveTable(table))
}


  
  // Take/change seat
  const takeSeat = (seat) =>{
    console.log('joining table');
    let tableId = activeTable?.id
    dispatch(gameActions.takeSeat(tableId, seat))
    // then show seat taken, emit to socket
  }

  const leaveSeat = (table) =>{
    console.log('leaving seat');
    dispatch(gameActions.leaveSeat(table.id))
    leaveTable(table)
  }

  const startPrivateGame = () =>{

  }

  const joinPrivateGame = () =>{

  }

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
                  <div>
                      <div className="games-grid">
                        {allGames && Object.values(allGames).map((game, index) => (
                          <GameTile key={index} game={game} checkTables={checkTables}/>
                        ))}
                      </div>
                    </div>
                )}



{/* SHOW AVAILABLE TABLES PER GAME TYPE */}
                {isLoaded && showTables && (
                  <div>
                      <div className="available-tables-grid">
                        {openTablesByGameType && openTablesByGameType.map((table, index) => (
                          <TableTile key={index} table={table} viewTable={viewTable}/>
                        ))}
                      </div>
                    </div>
                )}



{/* SHOW SELECTED TABLE */}
                {isLoaded && activeTable && (
                  <div>
                    {activeTable &&  (
                      <Game table={activeTable} leaveTable={leaveTable} leaveSeat={leaveSeat} takeSeat={takeSeat}/>
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
