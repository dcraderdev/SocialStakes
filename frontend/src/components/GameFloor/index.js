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

  const [tables, setTables] = useState({});

  const [isPickingGameType, setIsPickingGameType] = useState(false);
  const [isPickingBetSizing, setIsPickingBetSizing] = useState(false);
  const [isPickingPrivate, setIsPickingPrivate] = useState(false);
  const [privateKey, setPrivateKey] = useState('');

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
    console.log('clik');
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

      // dispatch(gameActions.viewTable(table.id)).then(()=>{
      // })
    }
  };

  console.log(currentTables);
console.log(allGames);
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

  const leaveSeat = (table) => {
    console.log('leaving seat');
    dispatch(gameActions.leaveSeat(table.id));
  };

  const startPrivateGame = () => {
    dispatch(showCreatingGameAction());
  };

  const joinPrivateGame = () => {};

  return (
    <>
      <div className={`gamefloor-wrapper ${activeTable ? 'table-view' : ''}`}>
        <div className="gamefloor-container">
          <div className="gamefloor-content">
            {!activeTable && (
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
                <div className="game-tile">
                  <p>{'whaaaaaa'}</p>
                </div>
                <div className="game-tile">
                  <p>{'aaaaaa'}</p>
                </div>
                <div className="game-tile">
                  <p>{'aaaaaaat'}</p>
                </div>
              </div>
            )}

            {/* SHOW GAMES AND PRIVATE TABLE BUTTONS */}
            {isLoaded && showGames && (
              <div className="games-grid">
                {allGames &&
                  Object.values(allGames).map((game, index) => (
                    <GameTile
                      key={index}
                      game={game}
                      checkTables={checkTables}
                    />
                  ))}
              </div>
            )}

            {/* SHOW AVAILABLE TABLES PER GAME TYPE */}
            {isLoaded && showTables && (
              <div className="available-tables-grid">

                <div className='flex'>
                {allGames &&
                  Object.values(allGames).map((game, index) => (
                    <div className='flex available-game-types' onClick={()=>checkTables(game.gameType)}>
                      {game.id}
                    </div>
                  ))
                }
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

                    <div className="deck-sort-container flex center">
                      <div className="deck-sort-text">Deck</div>
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
              <div className='creatinggame-container'>
                <CreatingGameView/>
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
