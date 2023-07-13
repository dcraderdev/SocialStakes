import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as gameActions from '../../redux/middleware/games';
import {
  showCreatingGameAction,
  showGamesAction,
  showTablesAction,
} from '../../redux/actions/gameActions';
import GameTile from '../GameTile';
import TableTile from '../TableTile';

import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';

import './GameFloor.css';
import Game from '../Game';
import CreatingGameView from '../CreatingGameView';

import gameTileBackground from '../../images/game-tile-background.jpeg';

function GameFloor() {
  const { socket } = useContext(SocketContext);
  const { openModal } = useContext(ModalContext);
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.users.user);
  const allGames = useSelector((state) => state.games.games);
  const openTablesByGameType = useSelector(
    (state) => state.games.openTablesByGameType
  );
  const currentTables = useSelector((state) => state.games.currentTables);

  const showGames = useSelector((state) => state.games.showGames);
  const showTables = useSelector((state) => state.games.showTables);
  const showCreatingGame = useSelector((state) => state.games.showCreatingGame);
  const activeTable = useSelector((state) => state.games.activeTable);

  const [isLoaded, setIsLoaded] = useState(false);

  const [currTables, setCurrTables] = useState('');

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
    console.log('goBack');
    dispatch(showGamesAction());
  };

  const checkTables = (gameType) => {
    // if(gameType === currTables) return
    console.log(gameType);
    setCurrTables(gameType);
    dispatch(gameActions.getTablesByType(gameType));
  };

  const viewTable = (table) => {
    console.log('viewing table');
    //join table's socket

    if (!user) {
      openModal('login');
      return;
    }
    if (user) {
      if (currentTables[table.id]) {
        socket.emit('view_room', table.id);
      } else {
        socket.emit('join_room', table.id);
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
          <i class="fa-solid fa-user-group"></i>
          <div className="gameicon-text">
            <div className="gameicon-text flex center">Multi Player</div>
            <div className="gameicon-text flex center">Blackjack</div>
          </div>
        </div>
      );
    }
    if (gameType === 'single_blackjack') {
      return (
        <div className="gameicon-container flex center">
          <i class="fa-solid fa-user"></i>
          <div className="gameicon-text">
            <div className="gameicon-text flex center">Single Player</div>
            <div className="gameicon-text flex center">Blackjack</div>
          </div>
        </div>
      );
    }
    if (gameType === 'poker') {
      return (
        <div className="gameicon-container flex center">
          <i class="fa-solid fa-user-group"></i>
          <div className="gameicon-text">
            <div className="gameicon-text flex center">Texas</div>
            <div className="gameicon-text flex center">Hold 'em</div>
          </div>
        </div>
      );
    }
    if (gameType === 'acey_duecey') {
      return (
        <div className="gameicon-container flex center">
          <i class="fa-solid fa-user-group"></i>
          <div className="gameicon-text">
            <div className="gameicon-text flex center">Acey</div>
            <div className="gameicon-text flex center">Duecey</div>
          </div>
        </div>
      );
    }
    if (gameType === 'coin_flip') {
      return (
        <div className="gameicon-container flex center">
          <i class="fa-solid fa-user-group"></i>
          <div className="gameicon-text">
            <div className="gameicon-text flex center">Coin</div>
            <div className="gameicon-text flex center">Flip</div>
          </div>
        </div>
      );
    }
    if (gameType === 'hi_lo') {
      return (
        <div className="gameicon-container flex center">
          <i class="fa-solid fa-user-group"></i>
          <div className="gameicon-text">
            <div className="gameicon-text flex center">Hi Lo</div>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div className={`gamefloor-wrapper ${activeTable ? 'table-view' : ''}`}>
        <div className="gamefloor-container">
          <div className="gamefloor-content">
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




            {!isLoaded && (
              <div className="games-grid">
                <div className="game-tile loading">
                  <img src={gameTileBackground} alt="game tile"></img>
                </div>
                <div className="game-tile loading">
                  <img src={gameTileBackground} alt="game tile"></img>
                </div>
                <div className="game-tile loading">
                  <img src={gameTileBackground} alt="game tile"></img>
                </div>
              </div>
            )}







            {/* SHOW GAMES AND PRIVATE TABLE BUTTONS */}
            {isLoaded && showGames && (
              <div className="games-grid">
                {allGames &&
                  Object.values(allGames).map((game, index) => (
                    <GameTile key={index} game={game} cbFunc={checkTables} />
                  ))}
              </div>
            )}

            {/* SHOW AVAILABLE TABLES PER GAME TYPE */}
            {isLoaded && showTables && (
              <div className="available-tables-grid">
                <div className="available-game-types-container flex">
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

                <div className="available-tables-sort-container flex">
                  <div className=" status-playercount-container flex center">
                    <div className="playercount-sort-container flex center">
                      <div className="playercount-curr">Players</div>
                      <div className="arrow-container flex">
                        <i className="sort-arrow fa-solid fa-angle-up"></i>
                        <i className="sort-arrow fa-solid fa-angle-down"></i>
                      </div>
                    </div>
                    <div className="tablename-sort-container flex center">
                      <div className="deck-sort-text">Table Name</div>
                      <div className="arrow-container flex">
                        <i className="sort-arrow fa-solid fa-angle-up"></i>
                        <i className="sort-arrow fa-solid fa-angle-down"></i>
                      </div>
                    </div>

                    <div className="deck-sort-container flex center">
                      <div className="deck-sort-text">Deck Size</div>
                      <div className="arrow-container flex">
                        <i className="sort-arrow fa-solid fa-angle-up"></i>
                        <i className="sort-arrow fa-solid fa-angle-down"></i>
                      </div>
                    </div>
                  </div>

                  <div className="betsize-sort-container flex center">
                    <div>min/max</div>
                    <div className="arrow-container flex">
                      <i className="sort-arrow fa-solid fa-angle-up"></i>
                      <i className="sort-arrow fa-solid fa-angle-down"></i>
                    </div>
                  </div>
                </div>
                {openTablesByGameType &&
                  openTablesByGameType.map((table, index) => (
                    <TableTile
                      key={index}
                      table={table}
                      viewTable={viewTable}
                    />
                  ))}
              </div>
            )}

            {/* SHOW SELECTED TABLE */}
            {isLoaded && activeTable && (
              <div className="game-view">{activeTable && <Game />}</div>
            )}

            {/* SHOW SELECTED TABLE */}
            {isLoaded && showCreatingGame && (
              <div className="creatinggame-container">
                <CreatingGameView />
              </div>
            )}

            {/* {showCreatingGame && (
  <div className={`creatinggame-container`}><div>
)} */}
          </div>
        </div>
      </div>
    </>
  );
}

export default GameFloor;
