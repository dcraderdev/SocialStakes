import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as gameActions from '../../redux/middleware/games';
import {
  showCreatingGameAction,
  showGamesAction,
  showTablesAction,
} from '../../redux/actions/gameActions';

import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';

import './GameFloor.css';

import GameTile from '../GameTile';
import Game from '../Game';
import Navigation from '../Navigation';
import CreatingGameView from '../CreatingGameView';
import TableTile from '../TableTile';
import TableSortBar from '../TableSortBar';
import PayoutChatbox from '../PayoutChatbox';

function GameFloor() {
  const { socket } = useContext(SocketContext);
  const { openModal, setUpdateObj, updateObj } = useContext(ModalContext);
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.users.user);
  const allGames = useSelector((state) => state.games.games);
  const openTablesByGameType = useSelector(state=> state.games.openTablesByGameType);
  const currentTables = useSelector((state) => state.games.currentTables);

  const showGames = useSelector((state) => state.games.showGames);
  const showTables = useSelector((state) => state.games.showTables);
  const showCreatingGame = useSelector((state) => state.games.showCreatingGame);
  const activeTable = useSelector((state) => state.games.activeTable);

  const [isLoaded, setIsLoaded] = useState(false);
  const [currTables, setCurrTables] = useState('');
  
  const [hasCurrentTables, setHasCurrentTables] = useState(false);



  // handle loading active games on component load
  useEffect(() => {
    dispatch(gameActions.getAllGames());
  }, []);

  // handle checking active games
  useEffect(() => {
    setIsLoaded(false);
    if (Object.values(allGames).length > 0) {
      setIsLoaded(true);
    }
  }, [allGames]);

  const goBack = () => {
    dispatch(showGamesAction());
  };

  const checkTables = (gameType) => {
    // if(gameType === currTables) return
    setCurrTables(gameType);
    dispatch(gameActions.getTablesByType(gameType));
  };

  const viewTable = (table) => {
    //join table's socket

    if (!user) {
      openModal('login');
      return;
    }
    if (user) {
      if (currentTables[table?.id]) {
        socket.emit('view_room', table?.id);
      } else {
        if(table.private){
          setUpdateObj({tableId:table?.id})
          openModal('joinPrivateGame');
        } else {
          socket.emit('join_room', table?.id);
        }
      }
    }
  };

  const startPrivateGame = () => {
    if (!user) {
      openModal('login');
      return;
    }
    dispatch(showCreatingGameAction());
  };

  const joinPrivateGame = () => {
    if (!user) {
      openModal('login');
      return;
    }
    openModal('joinPrivateGame');
  };

  const getIcon = (gameType) => {
    if (gameType === 'multi_blackjack') {
      return (
        <div className="gameicon-container flex center">
            <div className="gameicon-text flex center">Multi Player</div>
            <div className="gameicon-text flex center">Blackjack</div>
        </div>
      );
    }
    if (gameType === 'single_blackjack') {
      return (
        <div className="gameicon-container flex">
            <div className="gameicon-text flex center">Single Player</div>
            <div className="gameicon-text flex center">Blackjack</div>
        </div>
      );
    }
    if (gameType === 'poker') {
      return (
        <div className="gameicon-container flex center">
            <div className="gameicon-text flex center">Texas</div>
            <div className="gameicon-text flex center">Hold 'em</div>
        </div>
      );
    }
    if (gameType === 'acey_duecey') {
      return (
        <div className="gameicon-container flex center">
            <div className="gameicon-text flex center">Acey</div>
            <div className="gameicon-text flex center">Duecey</div>
        </div>
      );
    }
    if (gameType === 'coin_flip') {
      return (
        <div className="gameicon-container flex center">
            <div className="gameicon-text flex center">Coin</div>
            <div className="gameicon-text flex center">Flip</div>
        </div>
      );
    }
    if (gameType === 'hi_lo') {
      return (
        <div className="gameicon-container flex center">
            <div className="gameicon-text flex center">Hi Lo</div>
        </div>
      );
    }
  };



  //sets hieght for our sidemenu in case we have currentGames
  useEffect(() => {
    setHasCurrentTables(Object.entries(currentTables).length > 0);
  }, [currentTables]);


  const getViewHeight = () => {
    return hasCurrentTables ? 'creatinggame-wrapper' : 'creatinggame-wrapper extended';
  };
  


  return (
    
      <div className={`gamefloor-wrapper ${activeTable ? ' table-view' : ''}`}>
          <div className="gamefloor-container flex center">
<>


            {!activeTable && isLoaded && <Navigation />}

  

            {/* private game buttons */}
            {!activeTable && !showCreatingGame && (
              <div>
                <div className="private-game-buttons">
                  <div
                    className="private-game-button flex center"
                    onClick={startPrivateGame}
                  >
                    Start Private Game
                  </div>

                  <div
                    className="private-game-button flex center"
                    onClick={joinPrivateGame}
                  >
                    Join Private Game
                  </div>
                </div>
              </div>
            )}









            {/* SHOW GAMES AND PRIVATE TABLE BUTTONS */}
            {isLoaded && showGames && (

<div className='showgames-wrapper flex center'>


              <div className="games-grid">
                {allGames &&
                  Object.values(allGames).map((game, index) => (
                    <GameTile key={index} game={game} cbFunc={checkTables} delay={index} style={{animationDelay: `${index * 3}s`}} />
                  ))}
              </div>


              <div className="winnerchatbox-wrapper">
                  <PayoutChatbox />
              </div>

</div>





            )}





            {/* SHOW AVAILABLE TABLES PER GAME TYPE */}
            {isLoaded && showTables && (
              <div className="available-tables-grid">
                <div className="available-game-types-container flex center">
                  {allGames &&
                    Object.values(allGames).map((game, index) => (
                      <div
                        key={index}
                        className={`flex available-game-types flex center ${
                          currTables === game?.gameType ? ' highlite' : ''
                        }`}
                        onClick={() => checkTables(game?.gameType)}
                      >
                        {getIcon(game.gameType)}
                      </div>
                    ))}
                </div>

                <TableSortBar/>

                {openTablesByGameType.length > 0 &&
                  openTablesByGameType.map((table, index) => (
                    <TableTile
                      key={index}
                      table={table}
                      viewTable={viewTable}
                      delay={index}
                    />
                ))}
                {!openTablesByGameType.length &&
                  <div className='tables-coming-soon-container flex center'>Tables coming soon!</div>
                }
              </div>
            )}

            {/* SHOW SELECTED TABLE */}
            {isLoaded && activeTable && (
              <div className="game-view flex center">{activeTable && <Game />}</div>
            )}

            {/* SHOW SELECTED TABLE */}
            {isLoaded && showCreatingGame && (
              <div className={`creatinggame-wrapper ${hasCurrentTables ? '' : ' extended'}`}>
                <CreatingGameView />
              </div>
            )}

 </>
          </div>
        </div>
   
  );
}

export default GameFloor;
