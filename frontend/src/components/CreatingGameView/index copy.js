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
  const user = useSelector((state) => state.users.user);
  const allGames = useSelector((state) => state.games.games);

  const [isPickingGameType, setIsPickingGameType] = useState(true);
  const [isPickingVariant, setIsPickingVariant] = useState(false);
  const [isPickingBetSizing, setIsPickingBetSizing] = useState(false);
  const [isPickingPrivate, setIsPickingPrivate] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [tableName, setTableName] = useState(user ? `${user.username}'s table` : '');

  const [showValidationError, setShowValidationError] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [tableNameText, setTableNameText] = useState('');


  const [gameType, setGameType] = useState(false);
  const [deckSize, setDeckSize] = useState(false);
  const [betSizing, setBetSizing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);


  const blackjackDeckSizes = ['1 Deck', '4 Deck', '6 Deck'];
  const blackjackObj = {
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

  const getGameName = (gameType) => {
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
    return 'Coming Soon.'
  };

  const gameSelect = (gameType) => {
    let nonActiveGames = ['single_blackjack', 'poker', 'acey_duecey', 'coin_flip', 'hi_lo']
    if(nonActiveGames.includes(gameType)){
      return
    }
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
    if(!user) return

    if(validationErrors['tableName']){
      return
    }

    if(validationErrors['length'] || validationErrors['trimmed-error']){
      if(!showValidationError){
        setShowValidationError(true)
        setTimeout(() => {
          setShowValidationError(false)
        }, 3000);
      }
      return
    }

    if(Object.values(validationErrors).length){
      return
    }



    let tableObj = {
      userId: user.id,
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

  useEffect(() => {
    const errors = {};
    if (!tableName.length) errors['tableName'] = 'Please enter at least one character';
    if (!tableName.trim().length) errors['trimmed-error'] = 'Please enter at least one character';
    if (tableName.length > 30) errors['length'] = 'Must be 30 characters or less';
    setValidationErrors(errors);
  }, [tableName]);


  return (
    <div className="creatinggameview-container flex center">
      <div className="options-nav flex center">
        <div
          className={`optionsnav flex center gametype ${
            isPickingGameType ? ' highlite' : ''
          }`}
          onClick={() => navTo('gameType')}
        >
          <div className='flex center'>Game type</div>
          <div className='flex center'>{!gameType ? '-' : `${getGameName(gameType)}`}</div>
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
          {blackjackObj[deckSize].betSizes.map((sizing, index) => (
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
              placeholder="Table name"
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
