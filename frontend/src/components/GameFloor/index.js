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
  const tableInfo = useSelector((state) => state.games.tables);

  const games = ['spbj','mpbj', 'poker', 'hilo', 'aceyduecy' ,'coinflip']

  const [loaded, isLoaded] = useState(false);
  const [showGames, setShowGames] = useState(true);
  const [gameTables, setGameTables] = useState(null);


  useEffect(() => {
    isLoaded(false);

    dispatch(gameActions.getAllGames())
    // .then(isLoaded(true));

  }, [dispatch]);

  const back = () =>{
    setShowGames(true)
    setGameTables(null)
  }


  return ( 
    <>
      <div className='gamefloor-wrapper'>     
        <div className='gamefloor-container'>
          <div className='gamefloor-content'>
          {showGames && (
                  <div>
                      <div className="games-grid">
                        {games.map((game, index) => (
                          <GameTile key={index} game={game} setGameTables={setGameTables}/>
                        ))}
                      </div>
                      <div className='private-game-buttons'>
                        <div className='private-game-button'>Start Private Game</div>
                        <div className='private-game-button'>Join Private Game</div>
                      </div>


                    </div>
                )}

                {gameTables && tableInfo && (
                  <div className="available-tables-grid">
                  {tableInfo.map((table, index) => (
                    <TableTile key={index} table={table} back={back} />
                    ))}
                </div>
                )}

          </div>
          
        </div>
      </div>
    </>
  );

}

export default GameFloor;
