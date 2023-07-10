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

import './CreatingGameView.css';

const CreatingGameView = () => {
  const dispatch = useDispatch();

  const [isPickingGameType, setIsPickingGameType] = useState(true);
  const [isPickingVariant, setIsPickingVariant] = useState(true);
  const [isPickingBetSizing, setIsPickingBetSizing] = useState(false);
  const [isPickingPrivate, setIsPickingPrivate] = useState(false);
  const [privateKey, setPrivateKey] = useState('');

  const [gameType, setGameType] = useState(false);
  const [deckSize, setDeckSize] = useState(false);
  const [betSizing, setBetSizing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const user = useSelector((state) => state.users.user);
  const allGames = useSelector((state) => state.games.games);

  const blackjackDeckSizes = [1, 4, 6];
  const blackjackDict = {
    1: {
      betSizes: [
        {
          minBet: 1,
          maxBet: 50,
        },
        {
          minBet: 25,
          maxBet: 1250,
        },
        {
          minBet: 100,
          maxBet: 5000,
        },
      ],
    },
    4: {
      betSizes: [
        {
          minBet: 1,
          maxBet: 200,
        },
        {
          minBet: 1,
          maxBet: 5000,
        },
        {
          minBet: 100,
          maxBet: 25000,
        },
      ],
    },
    6: {
      betSizes: [
        {
          minBet: 1,
          maxBet: 500,
        },
        {
          minBet: 25,
          maxBet: 12500,
        },
        {
          minBet: 100,
          maxBet: 50000,
        },
      ],
    },
  };

  const gameSelect = (gameType) => {
    setGameType(gameType);
    setIsPickingGameType(false);
    setIsPickingVariant(true);
  };
  const deckSelect = (deck) => {
    setDeckSize(deck);
    setIsPickingVariant(false);
    setIsPickingBetSizing(true);
  };

  const betSelect = (sizing) => {
    setBetSizing(sizing);
    setIsPickingBetSizing(false);
    setIsPickingPrivate(true);
  };

  const createTable = () => {
    let tableObj = {
      gameType,
      deckSize,
      betSizing,
      isPrivate,
      privateKey,
    };
    dispatch(gameActions.createTable(tableObj));
  };

  return (
    <div className="creatinggameview-container">
      {isPickingGameType && (
        <div className="creatinggameview-isPickingGameType-container flex center">
          {allGames &&
            Object.values(allGames).map((game, index) => (
              <div
                key={index}
                className="flex center creatinggameview-options"
                onClick={() => gameSelect(game.gameType)}
              >
                {game.gameType}
              </div>
            ))}
        </div>
      )}

      {isPickingVariant && gameType && (
        <div className="creatinggameview-isPickingVariant-container flex center">
          {blackjackDeckSizes.map((deck, index) => (
            <div
              key={index}
              className="creatinggameview-options flex center"
              onClick={() => deckSelect(deck)}
            >
              {deck}
            </div>
          ))}
        </div>
      )}

      {isPickingBetSizing && deckSize && (
        <div className="creatinggameview-isPickingBetSizing-container flex center">
          {blackjackDict[deckSize].betSizes.map((sizing, index) => (
            <div
              key={index}
              className="creatinggameview-options flex center"
              onClick={() => betSelect(sizing)}
            >
              {sizing.minBet}/{sizing.maxBet}
            </div>
          ))}
        </div>
      )}

      {isPickingPrivate && (
        <div className="creatinggameview-isPickingPrivate-container flex center">
          <div
            className="creatinggameview-options flex center"
            onClick={() => setIsPrivate(true)}
          >
            Private?
          </div>
          <div
            className="creatinggameview-options flex center"
            onClick={() => setIsPrivate(false)}
          >
            Public?
          </div>
          {isPrivate && (
            <div>
              <form>
                <input
                  className="creatinggameview-privatekey"
                  type="text"
                  value={privateKey}
                  onInput={(e) => setPrivateKey(e.target.value)}
                  placeholder="Set private key"
                />
              </form>
            </div>
          )}

          <div onClick={createTable}>Create Table</div>
        </div>
      )}
    </div>
  );
};
export default CreatingGameView;
