import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as gameActions from '../../redux/middleware/games';
import GameTile from '../GameTile';
import TableTile from '../TableTile';



import './GameFloor.css';

function GameFloor() {

  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector(state => state.users.user);
  const allGames = useSelector((state) => state.games.games);
  const currentTableList = useSelector((state) => state.games.currentTableList);




  const [isLoaded, setIsLoaded] = useState(false);

  const [games, setGames] = useState({});
  const [tables, setTables] = useState({});

  const [showGames, setShowGames] = useState(true);
  const [showTables, setShowTables] = useState(false);
  
  
console.log(currentTableList);

  useEffect(() => {
    setIsLoaded(false);
    dispatch(gameActions.getAllGames())
    .then(setIsLoaded(true));

  }, [dispatch]);


  useEffect(() => {
    setIsLoaded(false);

    if(Object.values(allGames).length > 0){
      setGames(allGames)
      setIsLoaded(true)
    }

  }, [allGames]);




  useEffect(() => {
    setIsLoaded(false);

    if(currentTableList.length > 0){
      setGames(currentTableList)
      setShowTables(true)
      setShowGames(false)
      setIsLoaded(true)
    }

  }, [currentTableList]);



  const goBack = () =>{
    setShowGames(true)
    setShowTables(false)
  }


  const checkTables = (gameType) =>{
    dispatch(gameActions.getTablesByType(gameType))
  }

  const startPrivateGame = () =>{

  }

  const joinPrivateGame = () =>{

  }

  return ( 
    <>
      <div className='gamefloor-wrapper'>     
        <div className='gamefloor-container'>
          <div className='gamefloor-content'>


            <div className='private-game-buttons'>
              <div className='private-game-button' onClick={startPrivateGame}>Start Private Game</div>
              <div className='private-game-button' onClick={joinPrivateGame}>Join Private Game</div>
            </div>
            <div className='gamefloor-back-button-container'>
              <div className='gamefloor-back-button flex center' onClick={goBack}>
                <i className="fa-solid fa-arrow-left-long"></i>
              </div>

            </div>

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
                        {games && Object.values(games).map((game, index) => (
                          <GameTile key={index} game={game} checkTables={checkTables}/>
                        ))}
                      </div>
                    </div>
                )}


{/* SHOW AVAILABLE TABLES PER GAME TYPE */}
                {/* {gameTables && tableInfo && (
                  <div className="available-tables-grid">
                  {currentTableList.map((table, index) => (
                    ))}
                    </div>
                  )} */}



{/* SHOW AVAILABLE TABLES PER GAME TYPE */}
                {isLoaded && showTables && (
                  <div>
                      <div className="available-tables-grid">
                        {currentTableList && currentTableList.map((table, index) => (
                          <TableTile key={index} table={table}/>
                        ))}
                      </div>
                    </div>
                )}






          </div>
          
        </div>
      </div>
    </>
  );

}

export default GameFloor;
