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
  const allGames = useSelector((state) => state.games.games);



  // const games = ['Single Player Blackjack','Multi Player Blackjack', 'Poker', 'Hi Lo', 'Acey Duecy' ,'Coin Flip']

  const [isLoaded, setIsLoaded] = useState(false);
  const [games, setGames] = useState({});
  const [showGames, setShowGames] = useState(true);
  const [gameTables, setGameTables] = useState(null);
  const [lastView, setLastView] = useState(null);
  const [showJoinPrivateTableMenu, setShowJoinPrivateTableMenu] = useState(false);
  const [showStartPrivateTableMenu, setShowStartPrivateTableMenu] = useState(false);
  const [showGameSelection, setShowGameSelection] = useState(false);


  useEffect(() => {
    setIsLoaded(false);

    dispatch(gameActions.getAllGames())
    // .then(isLoaded(true));

  }, [dispatch]);

  useEffect(() => {

    if(Object.values(allGames).length > 0){
      setGames(allGames)
      setIsLoaded(true)
    }

  }, [allGames]);



  const back = () =>{
    setShowGames(true)
    setGameTables(null)
  }

  const goBack = () =>{
    setGames(allGames)
  }


  const handleClick = (selection) =>{
    console.log(games);
    console.log(selection);


    // dispatch(gameActions.getTablesByType)
    if(games[selection]){
      console.log('yes');
      console.log(games[selection]);
      
    }
    
    
    switch (selection) {
      case 'singlePlayerBlackjack':{
        if(isLoaded){
          setGames(allGames.singlePlayerBlackjack)
        }
      }
      case 'multiPlayerBlackjack':{
        if(isLoaded){
          setGames(allGames.multiPlayerBlackjack)
        }
      }  
      case '1_deck_low_stakes':{
        dispatch(gameActions.getTablesByType(games[selection].id))

      } 
      default:
        return
      }
      
      
  }

  return ( 
    <>
      <div className='gamefloor-wrapper'>     
        <div className='gamefloor-container'>
          <div className='gamefloor-content'>


            <div className='private-game-buttons'>
              <div className='private-game-button' onClick={()=>{handleClick('startPrivateGame')}}>Start Private Game</div>
              <div className='private-game-button' onClick={()=>{handleClick('joinPrivateGame')}}>Join Private Game</div>
            </div>
            <div className='gamefloor-back-button-container'>
              <div className='gamefloor-back-button flex center' onClick={goBack}>
                <i className="fa-solid fa-arrow-left-long"></i>
              </div>

            </div>


{/* SHOW GAMES AND PRIVATE TABLE BUTTONS */}
                {showGames && (
                  <div>
                      <div className="games-grid">
                        {games && Object.keys(games).map((game, index) => (
                          <GameTile key={index} game={game} handleClick={handleClick}/>
                        ))}
                      </div>
                    </div>
                )}


{/* SHOW AVAILABLE TABLES PER GAME TYPE */}
                {gameTables && tableInfo && (
                  <div className="available-tables-grid">
                  {tableInfo.map((table, index) => (
                    <TableTile key={index} table={table} back={back} />
                    ))}
                </div>
                )}



{/* SHOW AVAILABLE TABLES PER GAME TYPE */}
                {showGameSelection && (
                  <div>
                      <div className="games-grid">
                        {games.map((game, index) => (
                          <GameTile key={index} game={game} setGameTables={setGameTables} handleClick={handleClick}/>
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
