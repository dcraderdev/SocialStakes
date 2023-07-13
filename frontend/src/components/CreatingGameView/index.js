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
  const { socket } = useContext(SocketContext);

  const [isPickingGameType, setIsPickingGameType] = useState(true);
  const [isPickingVariant, setIsPickingVariant] = useState(false);
  const [isPickingBetSizing, setIsPickingBetSizing] = useState(false);
  const [isPickingPrivate, setIsPickingPrivate] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [tableName, setTableName] = useState('');

  const [gameType, setGameType] = useState(false);
  const [deckSize, setDeckSize] = useState(false);
  const [betSizing, setBetSizing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const user = useSelector((state) => state.users.user);
  const allGames = useSelector((state) => state.games.games);

  const blackjackDeckSizes = ['1 Deck', '4 Deck', '6 Deck'];
  const blackjackDict = {
    '1 Deck': {
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
    '4 Deck': {
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
    '6 Deck': {
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

  const getName = (gameType) => {
    if (gameType === 'multi_blackjack') {
      return `Multi Player Blackjack`;
    }
    if (gameType === 'single_blackjack') {
      return `Single Player Blackjack`;
    }
    if (gameType === 'poker') {
      return `Texas Hold 'em`;
    }
    if (gameType === 'acey_duecey') {
      return `Acey Duecey`;
    }
    if (gameType === 'coin_flip') {
      return `Coin Flip`;
    }
    if (gameType === 'hi_lo') {
      return 'Hi Lo';
    }
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
      tableName,
    };
    dispatch(gameActions.createTable(tableObj, socket));
  };

  const navTo = (nav) => {
    if (nav === 'gameType') {
      setIsPickingGameType(true);
      setIsPickingVariant(false);
      setIsPickingBetSizing(false);
      setIsPickingPrivate(false);
    }
    if (nav === 'variant') {
      if (!gameType) {
        navTo('gameType');
        return;
      }
      setIsPickingGameType(false);
      setIsPickingVariant(true);
      setIsPickingBetSizing(false);
      setIsPickingPrivate(false);
    }
    if (nav === 'betSizes') {
      if (!deckSize) {
        navTo('variant');
        return;
      }
      setIsPickingGameType(false);
      setIsPickingVariant(false);
      setIsPickingBetSizing(true);
      setIsPickingPrivate(false);
    }
    if (nav === 'private') {
      setIsPickingGameType(false);
      setIsPickingVariant(false);
      setIsPickingBetSizing(false);
      setIsPickingPrivate(true);
    }
  };

  return (
    <div className="creatinggameview-container flex center">
      <div className="options-nav flex center">
        <div
          className={`optionsnav flex center gametype ${
            isPickingGameType ? ' highlite' : ''
          }`}
          onClick={() => navTo('gameType')}
        >
          <div>Game type</div>
          <div>{!gameType ? '-' : `${getName(gameType)}`}</div>
        </div>
        <div
          className={`optionsnav flex center variant ${
            isPickingVariant ? ' highlite' : ''
          }`}
          onClick={() => navTo('variant')}
        >
          <div>Variant</div>
          <div>{!deckSize ? '-' : `${deckSize}`}</div>
        </div>
        <div
          className={`optionsnav flex center betsize ${
            isPickingBetSizing ? ' highlite' : ''
          }`}
          onClick={() => navTo('betSizes')}
        >
          <div>Bet Sizes</div>
          <div>
            {!betSizing ? '-' : `${betSizing.minBet}/${betSizing.maxBet}`}
          </div>
        </div>
        <div
          className={`optionsnav flex center privateoption ${
            isPickingPrivate ? ' highlite' : ''
          }`}
          onClick={() => navTo('private')}
        >
          <div>Private</div>
          <div>{isPrivate ? 'Private' : 'Open'}</div>
        </div>
      </div>

      {isPickingGameType && (
        <div className="creatinggameview-isPickingGameType-wrapper flex center">
          <div className="creatinggameview-isPickingGameType-container flex center">
            {allGames &&
              Object.values(allGames).map((game, index) => (
                <GameTile key={index} game={game} cbFunc={gameSelect} />
              ))}
          </div>
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
          <div className="private-open-buttons-container flex">
            <div
              className="creatinggameview-options flex center"
              onClick={() => setIsPrivate(false)}
            >
              Public
            </div>
            <div
              className="creatinggameview-options flex center"
              onClick={() => setIsPrivate(true)}
            >
              Private
            </div>
          </div>

          <div
            className={`creatinggameview-tablename-container flex center ${
              isPrivate ? '' : ' centered'
            }`}
          >
            <input
              className="creatinggameview-tablename"
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Table name (optional)"
            />

            {isPrivate && (
              <input
                className="creatinggameview-privatekey"
                type="text"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Set private key"
              />
            )}
          </div>

          <div className="creatinggameview-create-button" onClick={createTable}>
            Create Table
          </div>
        </div>
      )}
    </div>
  );
};
export default CreatingGameView;
