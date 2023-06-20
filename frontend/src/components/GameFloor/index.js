import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as gameActions from '../../redux/middleware/games';
import GameTile from '../GameTile';
import TableTile from '../TableTile';



import './GameFloor.css';
import Game from '../Game';

function GameFloor() {

  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector(state => state.users.user);
  const allGames = useSelector((state) => state.games.games);
  const openTablesByGameType = useSelector((state) => state.games.openTablesByGameType);


  const [isLoaded, setIsLoaded] = useState(false);

  const [games, setGames] = useState({});
  const [tables, setTables] = useState({});

  const [showGames, setShowGames] = useState(true);
  const [showTables, setShowTables] = useState(false);
  const [showActiveTable, setShowActiveTable] = useState(false);

  
  const [currentTables, setCurrentTables] = useState(null);
  const [activeTable, setActiveTable] = useState(null);
  
  
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



  // handle checking active tables
  useEffect(() => {
    setIsLoaded(false);
    if(openTablesByGameType.length > 0){
      setGames(openTablesByGameType)
      setShowTables(true)
      setShowGames(false)
      setIsLoaded(true)
    }
  }, [openTablesByGameType]);



  // handle active table change
  useEffect(() => {
    if(activeTable){
      setShowTables(false)
      setShowGames(false)
      setShowActiveTable(true)
    }
  }, [activeTable]);




  const goBack = () =>{
    console.log('goBack');
    setShowGames(true)
    setShowTables(false)
    if(Object.values(allGames).length > 0){
      setIsLoaded(true)
    }
  }

  const navToGamesList = () => {
    setShowGames(true)
    setShowTables(false)
    setShowActiveTable(false)
    setActiveTable(null)
  }


  const checkTables = (gameType) =>{
    dispatch(gameActions.getTablesByType(gameType))
  }



  const viewTable = (table) =>{
      //join table's socket
      setActiveTable(table)
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
    navToGamesList()
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

          {!showActiveTable && (
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
                {/* {gameTables && tableInfo && (
                  <div className="available-tables-grid">
                  {openTablesByGameType.map((table, index) => (
                    ))}
                    </div>
                  )} */}



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
                {isLoaded && showActiveTable && (
                  <div>
                    {activeTable &&  (
                      <Game table={activeTable} leaveSeat={leaveSeat} takeSeat={takeSeat}/>
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
