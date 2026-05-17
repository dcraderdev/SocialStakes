import { React, useState, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as gameActions from '../../redux/middleware/games';
import GameTile from '../GameTile';

import { SocketContext } from '../../context/SocketContext';

import './CreatingGameView.css';
import FriendTile from '../FriendTile';

const CreatingGameView = () => {
  const dispatch = useDispatch();
  const { socket } = useContext(SocketContext);
  const tableNameInputRef = useRef();
  const privateKeyInputRef = useRef();
  const user = useSelector((state) => state.users.user);
  const allGames = useSelector((state) => state.games.games);
  const friends = useSelector((state) => state.friends);
  const currentTables = useSelector((state) => state.games.currentTables);

  const pickingGameType = 'pickingGameType';
  const choosingSettings = 'choosingSettings';
  const invitingFriends = 'invitingFriends';
  const reviewingGameOptions = 'reviewingGameOptions';

  const [focus, setFocus] = useState(pickingGameType);

  const [privateKey, setPrivateKey] = useState('');
  const [tableName, setTableName] = useState(user ? `${user.username}'s table` : '');

  const [showValidationError, setShowValidationError] = useState(false);
  const [privateKeyValidationErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [hasCurrentTables, setHasCurrentTables] = useState(false);

  const [displayGameType, setDisplayGameType] = useState(null);
  const [gameType, setGameType] = useState(null);
  const [deckSize, setDeckSize] = useState(1);
  const [betSizing, setBetSizing] = useState(null);
  // default false so "No" button shows selected from the start
  const [isPrivate, setIsPrivate] = useState(false);

  const [privateWarning, setPrivateWarning] = useState(false);
  const [friendList, setFriendList] = useState({});
  const [tableStartValidationErrors, setTableStartValidationErrors] = useState({});
  const [disabledButton, setDisabledButton] = useState(false);
  const [buttonClass, setButtonClass] = useState('starttable-submit-button');
  const [animateTiles, setAnimateTiles] = useState(false);

  const blackjackObj = {
    1: {
      betSizes: [
        { minBet: 1, maxBet: 50 },
        { minBet: 25, maxBet: 1250 },
        { minBet: 100, maxBet: 5000 },
      ],
    },
    4: {
      betSizes: [
        { minBet: 1, maxBet: 200 },
        { minBet: 1, maxBet: 5000 },
        { minBet: 100, maxBet: 25000 },
      ],
    },
    6: {
      betSizes: [
        { minBet: 1, maxBet: 500 },
        { minBet: 25, maxBet: 12500 },
        { minBet: 100, maxBet: 50000 },
      ],
    },
  };

  useEffect(() => {
    setHasCurrentTables(Object.entries(currentTables).length > 0);
  }, [currentTables]);

  const getGameName = (gt) => {
    if (gt === 'multi_blackjack') return 'Multi Player Blackjack';
    if (gt === 'single_blackjack') return 'Single Player Blackjack';
    if (gt === 'poker') return "Texas Hold 'em";
    if (gt === 'acey_duecey') return 'Acey Duecey';
    if (gt === 'coin_flip') return 'Coin Flip';
    if (gt === 'hi_lo') return 'Hi Lo';
    return '–';
  };

  const gameSelect = (gt) => {
    const nonActiveGames = ['single_blackjack', 'poker'];
    if (nonActiveGames.includes(gt)) return;
    setGameType(gt);
    setDisplayGameType(getGameName(gt));
    setFocus(choosingSettings);
  };

  const createTable = () => {
    if (disabledButton) return;
    if (!user) return;
    if (!gameType) return;
    if (!betSizing) return;

    if (validationErrors['tableName']) return;
    if (validationErrors['length'] || validationErrors['trimmed-error']) {
      if (!showValidationError) {
        setShowValidationError(true);
        setTimeout(() => setShowValidationError(false), 3000);
      }
      return;
    }
    if (Object.values(validationErrors).length) return;

    // anti-spam guard
    setDisabledButton(true);
    setTimeout(() => setDisabledButton(false), 2000);

    const tableObj = {
      gameType,
      deckSize,
      betSizing,
      isPrivate,
      privateKey,
      tableName,
    };

    dispatch(gameActions.createTable(tableObj, socket));
  };

  // Table name validation
  useEffect(() => {
    const errors = {};
    if (!tableName.length) errors['tableName'] = 'Please enter at least one character';
    if (!tableName.trim().length) errors['trimmed-error'] = 'Please enter at least one character';
    if (tableName.length > 30) errors['length'] = 'Must be 30 characters or less';
    setValidationErrors(errors);
  }, [tableName]);

  // Settings validation (deck + bet sizing)
  useEffect(() => {
    const errors = {};
    if (!betSizing) errors['betSizing'] = 'Please choose a bet sizing';
    setTableStartValidationErrors(errors);
  }, [betSizing]);

  // Button disabled CSS class
  useEffect(() => {
    if (Object.keys(tableStartValidationErrors).length > 0) {
      setButtonClass('starttable-submit-button disabled');
    } else {
      setButtonClass('starttable-submit-button');
    }
  }, [tableStartValidationErrors]);

  // Focus table name input on mount
  useEffect(() => {
    if (tableNameInputRef.current) tableNameInputRef.current.focus();
  }, []);

  // Private key warning
  useEffect(() => {
    setPrivateWarning(isPrivate && privateKey.trim() === '');
  }, [privateKey, isPrivate]);

  const handleList = (friend, option) => {
    const newFriendList = { ...friendList };
    if (option === 'add') newFriendList[friend.id] = friend;
    if (option === 'remove' && newFriendList[friend.id]) delete newFriendList[friend.id];
    setFriendList(newFriendList);
  };

  // Nav tabs always navigate — no more blocking on gameType
  const handleNavClick = (newFocus) => {
    setFocus(newFocus);
  };

  const betSizingLabel = betSizing
    ? `${betSizing.minBet}/${betSizing.maxBet}`
    : '–';

  return (
    <div className="creatinggameview-container flex">

      {/* ── Left nav ── */}
      <div className={`creatinggameview-settings-container flex ${hasCurrentTables ? ' shrunk' : ' extended'}`}>

        <div onClick={() => handleNavClick(pickingGameType)} className="creatinggameview-nav-option flex center">
          <div className={`creatinggameview-option-header cg-nav-inner ${focus === pickingGameType ? ' creatinggameview-active-nav' : ''} flex center`}>
            <span>Game Type</span>
            <span className="cg-nav-sub">{displayGameType || '–'}</span>
          </div>
        </div>

        <div onClick={() => handleNavClick(choosingSettings)} className="creatinggameview-nav-option flex center">
          <div className={`creatinggameview-option-header cg-nav-inner ${focus === choosingSettings ? ' creatinggameview-active-nav' : ''} flex center`}>
            <span>Settings</span>
            {gameType && <span className="cg-nav-sub">{deckSize} deck · {betSizingLabel}</span>}
          </div>
        </div>

        <div onClick={() => handleNavClick(invitingFriends)} className="creatinggameview-nav-option flex center">
          <div className={`creatinggameview-option-header cg-nav-inner ${focus === invitingFriends ? ' creatinggameview-active-nav' : ''} flex center`}>
            <span>Invite Friends</span>
            {Object.keys(friendList).length > 0 && (
              <span className="cg-nav-sub">{Object.keys(friendList).length} invited</span>
            )}
          </div>
        </div>

        <div onClick={() => handleNavClick(reviewingGameOptions)} className="creatinggameview-nav-option flex center">
          <div className={`creatinggameview-option-header cg-nav-inner ${focus === reviewingGameOptions ? ' creatinggameview-active-nav' : ''} flex center`}>
            <span>Review &amp; Start</span>
          </div>
        </div>

      </div>


      {/* ── Right content ── */}
      <div className="creatinggameview-options-wrapper flex">

        {/* Table name input */}
        <div className="creatinggameview-tablename-container flex center">
          {showValidationError && (
            <div className="creatinggameview validation-handling flex center">
              {validationErrors['trimmed-error'] && validationErrors['trimmed-error']}
              {validationErrors['length'] && validationErrors['length']}
            </div>
          )}
          <form onSubmit={(e) => e.preventDefault()} className="creatinggameview-name flex center">
            <input
              ref={tableNameInputRef}
              className="creatinggameview-chatname"
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              required
              placeholder={validationErrors['tableName'] || ''}
            />
            <button style={{ display: 'none' }} />
          </form>
        </div>

        <div className="creatinggameview-options-container styled-scrollbar">

          {/* ── Pick game type ── */}
          {focus === pickingGameType && (
            <div className={`flex creatinggameview-choosingSettings-container ${hasCurrentTables ? '' : ' extended'}`}>
              <div className="creatinggameview-settings-header flex center">
                <div className="creatinggameview-settings-header-text flex center">
                  Choose Game Type
                </div>
              </div>
              <div className={`creatinggameview-isPickingGameType-container styled-scrollbar ${hasCurrentTables ? '' : ' extended'}`}>
                {allGames &&
                  Object.values(allGames).map((game, index) => (
                    <GameTile
                      key={index}
                      game={game}
                      cbFunc={gameSelect}
                      delay={index}
                      animateTiles={animateTiles}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* ── Settings ── */}
          {focus === choosingSettings && (
            <div className={`flex creatinggameview-choosingSettings-container ${hasCurrentTables ? '' : ' extended'}`}>

              {!gameType ? (
                <div className="cg-prereq-message flex center">
                  <span>← Select a game type first</span>
                  <button className="cg-prereq-btn" onClick={() => setFocus(pickingGameType)}>
                    Choose Game
                  </button>
                </div>
              ) : (
                <>
                  <div className="creatinggameview-settings-header flex center">
                    <div className="creatinggameview-settings-header-text flex center">
                      {displayGameType} Settings
                    </div>
                  </div>

                  <div className="creatinggameview-settings-options styled-scrollbar flex">

                    {/* Private game */}
                    <div className="creatinggameview-settings-option flex center">
                      <div className="creatinggameview-settings-option-header flex center">
                        Private Game?
                      </div>
                      <div className="creatinggameview-settings-button-container flex center">
                        <div className="creatinggameview-settings-option-button flex center">
                          <div className="creatinggameview-button-header">Yes</div>
                          <div
                            onClick={() => {
                              setIsPrivate(true);
                              if (privateKeyInputRef.current) privateKeyInputRef.current.focus();
                            }}
                            className="creatinggameview-button-button flex center"
                          >
                            {isPrivate === true && <i className="fa-solid fa-check priority" />}
                          </div>
                        </div>
                        <div className="creatinggameview-settings-option-button flex center">
                          <div className="creatinggameview-button-header">No</div>
                          <div
                            onClick={() => setIsPrivate(false)}
                            className="creatinggameview-button-button flex center"
                          >
                            {isPrivate === false && <i className="fa-solid fa-check priority" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Private key */}
                    <div className="creatinggameview-settings-option flex center">
                      <div className={`creatinggameview-settings-option-header flex center${isPrivate ? '' : ' grey'}`}>
                        Private Key
                      </div>
                      <div className="creatinggameview-settings-button-container flex center">
                        <form onSubmit={(e) => e.preventDefault()} className="creatinggameview-name flex center">
                          <input
                            ref={privateKeyInputRef}
                            className={`creatinggameview-chatname${isPrivate ? '' : ' grey'}`}
                            type="text"
                            value={privateKey}
                            onChange={(e) => setPrivateKey(e.target.value)}
                            disabled={!isPrivate}
                            placeholder={privateKeyValidationErrors['privateKey'] || ''}
                          />
                          <button style={{ display: 'none' }} />
                        </form>
                      </div>
                    </div>

                    {/* Number of decks */}
                    <div className="creatinggameview-settings-option flex center">
                      <div className="creatinggameview-settings-option-header flex center">
                        Number of decks?
                      </div>
                      <div className="creatinggameview-settings-button-container flex center">
                        {[1, 4, 6].map((n) => (
                          <div key={n} className="creatinggameview-settings-option-button flex center">
                            <div className="creatinggameview-button-header">{n}</div>
                            <div
                              onClick={() => {
                                setDeckSize(n);
                                setBetSizing(null);
                              }}
                              className="creatinggameview-button-button flex center"
                            >
                              {deckSize === n && <i className="fa-solid fa-check priority" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Min/Max bets */}
                    <div className="creatinggameview-settings-option flex center">
                      <div className="creatinggameview-settings-option-header flex center">
                        Min/Max Bets?
                      </div>
                      <div className="creatinggameview-settings-button-container flex center">
                        {blackjackObj[deckSize] &&
                          blackjackObj[deckSize].betSizes.map((sizing, index) => (
                            <div key={index} className="creatinggameview-settings-option-button flex center">
                              <div className="creatinggameview-button-header bet-sizing">
                                {sizing.minBet}/{sizing.maxBet}
                              </div>
                              <div
                                onClick={() => setBetSizing(sizing)}
                                className="creatinggameview-button-button flex center"
                              >
                                {betSizing &&
                                  betSizing.maxBet === sizing.maxBet &&
                                  betSizing.minBet === sizing.minBet && (
                                    <i className="fa-solid fa-check priority" />
                                  )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Invite friends ── */}
          {focus === invitingFriends && (
            <div className={`flex creatinggameview-choosingSettings-container ${hasCurrentTables ? '' : ' extended'}`}>

              {!gameType ? (
                <div className="cg-prereq-message flex center">
                  <span>← Select a game type first</span>
                  <button className="cg-prereq-btn" onClick={() => setFocus(pickingGameType)}>
                    Choose Game
                  </button>
                </div>
              ) : (
                <>
                  <div className="creatinggameview-settings-header flex center">
                    <div className="creatinggameview-settings-header-text flex center">
                      Invite Some Friends
                    </div>
                  </div>
                  <div className="creatinggameview-friendtiles-container styled-scrollbar">
                    {friends &&
                      Object.entries(friends.friends).map(([key, friend], index) => (
                        <div key={index} className="creatinggameview-friendtile-wrapper">
                          <FriendTile
                            friend={friend}
                            type="invite-to-conversation"
                            cb={handleList}
                            isInvited={friendList[friend?.id]}
                          />
                        </div>
                      ))}
                    {friends && Object.entries(friends.friends).length === 0 && (
                      <div className="cg-prereq-message flex center" style={{ marginTop: '30px' }}>
                        No friends to invite yet.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Review & Start ── */}
          {focus === reviewingGameOptions && (
            <div className={`flex creatinggameview-choosingSettings-container ${hasCurrentTables ? '' : ' extended'}`}>

              {!gameType ? (
                <div className="cg-prereq-message flex center">
                  <span>← Select a game type first</span>
                  <button className="cg-prereq-btn" onClick={() => setFocus(pickingGameType)}>
                    Choose Game
                  </button>
                </div>
              ) : (
                <>
                  <div className="creatinggameview-settings-header flex center">
                    <div className="creatinggameview-settings-header-text flex center">
                      Review and Start
                    </div>
                  </div>

                  <div className="creatinggameview-review-wrapper styled-scrollbar">

                    <div className="creatinggameview-review-option flex center">
                      <div className="creatinggameview-settings-option-header flex center">
                        Game Type – {displayGameType}
                      </div>
                    </div>

                    <div className="creatinggameview-review-option flex center">
                      <div className="creatinggameview-settings-option-header flex center">
                        Private Game – {isPrivate ? 'Yes' : 'No'}
                      </div>
                    </div>

                    {isPrivate && (
                      <div className="creatinggameview-review-option flex center">
                        <div className="creatinggameview-settings-option-header flex center">
                          Private Key –&nbsp;
                          {!privateWarning ? (
                            <span>{privateKey}</span>
                          ) : (
                            <div className="flex">
                              <div
                                onClick={() => {
                                  setFocus(choosingSettings);
                                  setTimeout(() => {
                                    if (privateKeyInputRef.current) privateKeyInputRef.current.focus();
                                  }, 100);
                                }}
                                className="creatinggameview-settings-selection flex center red"
                              >
                                None
                              </div>
                              <div className="creatinggameview-noprivatekey">(table will be set to open)</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="creatinggameview-review-option flex center">
                      <div className="creatinggameview-settings-option-header flex center">
                        Number of Decks – {deckSize}
                      </div>
                    </div>

                    <div className="creatinggameview-review-option flex center">
                      <div className="creatinggameview-settings-option-header flex center">
                        Min/Max Bets –&nbsp;
                        <div
                          onClick={() => setFocus(choosingSettings)}
                          className={`creatinggameview-settings-selection flex center${betSizing ? '' : ' red'}`}
                        >
                          {betSizing
                            ? `${betSizing.minBet}/${betSizing.maxBet}`
                            : 'None – click to set'}
                        </div>
                      </div>
                    </div>

                    {Object.values(friendList).length === 0 ? (
                      <div className="creatinggameview-nofriends-option flex center">
                        <div className="creatinggameview-settings-option-header nofriends flex center">
                          No friends invited.
                        </div>
                        <div
                          onClick={() => setFocus(invitingFriends)}
                          className="creatinggameview-invitefriends-button"
                        >
                          Invite friends?
                        </div>
                      </div>
                    ) : (
                      <div className="creatinggameview-friends-option styled-scrollbar flex center">
                        {Object.entries(friendList).map(([key, friend], index) => (
                          <FriendTile
                            key={index}
                            friend={friend}
                            type="invited-to-table"
                            cb={handleList}
                            isInvited={friendList[friend?.id]}
                          />
                        ))}
                      </div>
                    )}

                    <div className="creatinggameview-start-option flex center">
                      <div onClick={createTable} className={buttonClass}>
                        Start Table
                      </div>
                    </div>

                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CreatingGameView;
