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
import FriendTile from '../FriendTile';
import { Pricing } from 'aws-sdk';

const CreatingGameView = () => {
  const dispatch = useDispatch();
  const { socket } = useContext(SocketContext);
  const tableNameInputRef = useRef()
  const privateKeyInputRef = useRef()
  const user = useSelector((state) => state.users.user);
  const allGames = useSelector((state) => state.games.games);
  const friends = useSelector((state) => state.friends);
  const currentTables = useSelector((state) => state.games.currentTables);
  
  const pickingGameType = 'pickingGameType'
  const choosingSettings = 'choosingSettings'
  const invitingFriends = 'invitingFriends'
  const reviewingGameOptions = 'reviewingGameOptions'



  const [focus, setFocus] = useState(pickingGameType);


  const [privateKey, setPrivateKey] = useState('');
  const [tableName, setTableName] = useState(user ? `${user.username}'s table` : '');

  const [showValidationError, setShowValidationError] = useState(false);
  
  const [privateKeyValidationErrors, setPrivateKeyValidationErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [tableNameText, setTableNameText] = useState('');
  const [hasCurrentTables, setHasCurrentTables] = useState('');


  const [displayGameType, setDisplayGameType] = useState(null);
  const [gameType, setGameType] = useState(null);
  const [deckSize, setDeckSize] = useState(1);
  const [betSizing, setBetSizing] = useState(null);
  const [isPrivate, setIsPrivate] = useState(null);

  const [privateWarning, setPrivateWarning] = useState(null);

  const [friendList, setFriendList] = useState({})

  const [tableStartValidationErrors, setTableStartValidationErrors] = useState({});
  const [disabledButton, setDisabledButton] = useState(false);
  const [buttonClass, setButtonClass] = useState('starttable-submit-button');

  const [animateTiles, setAnimateTiles] = useState(false);


  const blackjackObj = {
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



  useEffect(() => {
    setHasCurrentTables(Object.entries(currentTables).length > 0);
  }, [currentTables]);





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
    return '-'
  };

  const gameSelect = (gameType) => {
    let nonActiveGames = ['single_blackjack', 'poker', 'acey_duecey', 'coin_flip', 'hi_lo']
    if(nonActiveGames.includes(gameType)){
      return
    }
    
    setGameType(gameType);
    setDisplayGameType(()=>getGameName(gameType))
    setFocus(choosingSettings)
  };



  const createTable = () => {

    if(disabledButton) return
    if(!user) return
    if(validationErrors['tableName']){
      return
    }

    if(validationErrors['length'] || validationErrors['trimmed-error']){
      if(!showValidationError){
        setShowValidationError(true)
        setTimeout(() => {
          setShowValidationError(false)
        }, 300000);
      }
      return
    }

    if(Object.values(validationErrors).length){
      return
    }

    // handling for button spammers
    setDisabledButton(true)
    setTimeout(() => {
      setDisabledButton(false)
    }, 2000);

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



// Table Name validation errors
  useEffect(() => {
    const errors = {};
    if (!tableName.length) errors['tableName'] = 'Please enter at least one character';
    if (!tableName.trim().length) errors['trimmed-error'] = 'Please enter at least one character';
    if (tableName.length > 30) errors['length'] = 'Must be 30 characters or less';
    setValidationErrors(errors);
  }, [tableName]);



  // Table Start validation errors
  useEffect(() => {
    const errors = {};
    if (!deckSize) errors['deckSize'] = 'Please choose a deck size';
    if (!betSizing) errors['betSizing'] = 'Please choose a bet sizing';
    setTableStartValidationErrors(errors);
  }, [deckSize, betSizing ]);



  // Disable Table Start IF validation errors
  useEffect(() => {
    if (Object.keys(tableStartValidationErrors).length > 0) {
      setButtonClass('starttable-submit-button disabled');
    } else {
      setButtonClass('starttable-submit-button');
    }
  }, [tableStartValidationErrors]);
  
  







  useEffect(() => {
    tableNameInputRef.current.focus();
  }, []);


  useEffect(() => {
    setPrivateWarning(false)
    if(isPrivate && privateKey.trim()===''){
      setPrivateWarning(true)
    }
    if(privateKey){
      setPrivateKey(privateKey.trim())
    }
  }, [privateKey, isPrivate]);

  





const handleList = (friend, option) =>{
  let newFriendList = {...friendList}

  if(option === 'add'){
    newFriendList[friend.id] = friend
  }

  if(newFriendList[friend.id] && option === 'remove'){
    delete newFriendList[friend.id]
  }

  setFriendList(newFriendList)

}

const handleAnimation = () =>{
  if(!Object.values(allGames)) return
  let timer = Object.values(allGames).length * 300
  setAnimateTiles(true);
  setTimeout(() => {
    
    setAnimateTiles(false);
  }, timer);
  return

}


const toggleFocus = (newFocus) =>{
  setAnimateTiles(true);
  setAnimateTiles(false);

  if(!gameType) {
    handleAnimation()
    return
  }

  setFocus(newFocus)


  

  return

}







  return (
    <div className="creatinggameview-container flex">





    <div className={`creatinggameview-settings-container flex ${hasCurrentTables ? ' shrunk' : ' extended'}`}>

      <div onClick={()=>setFocus(pickingGameType)} className='creatinggameview-nav-option flex center'>
        <div className={`creatinggameview-option-header ${focus === pickingGameType ? ' creatinggameview-active-nav' : ''} flex center`}>
          Game Type
        </div>
      </div>

      <div  
      onClick={()=>toggleFocus(choosingSettings)} 
      className='creatinggameview-nav-option flex center'
      >
        <div className={`creatinggameview-option-header ${focus === choosingSettings ? ' creatinggameview-active-nav' : ''} flex center`}>
          Settings
        </div>
      </div>

      <div 
      onClick={()=>toggleFocus(invitingFriends)}
      className='creatinggameview-nav-option flex center'
      >
        <div className={`creatinggameview-option-header ${focus === invitingFriends ? ' creatinggameview-active-nav' : ''} flex center`}>
          Invite Friends
        </div>
      </div>


      <div
      onClick={()=>toggleFocus(reviewingGameOptions)}
      className='creatinggameview-nav-option flex center'
      >
        <div className={`creatinggameview-option-header ${focus === reviewingGameOptions ? ' creatinggameview-active-nav' : ''} flex center`}>
          Review and Start
        </div>
      </div>

      
    </div>



    <div className='creatinggameview-options-wrapper flex'>

    <div className='creatinggameview-tablename-container flex center'>

      {showValidationError && (
        <div className={`creatinggameview validation-handling flex center `}>
          {validationErrors['trimmed-error'] && validationErrors['trimmed-error']}
          {showValidationError && validationErrors['length'] && validationErrors['length']}
        </div>
      )}
      
{/* TableName form */}

        <form 
        onSubmit={(e)=>{
          e.preventDefault()
          return
        }} 
        className={`creatinggameview-name flex center`}
        >

        <input
          ref={tableNameInputRef}
          className={`creatinggameview-chatname`}
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          required
          placeholder={validationErrors['tableName'] || ''}
        />

        <button style={{display: 'none'}}></button>


      </form>
    </div>


          
      <div className={`creatinggameview-options-container styled-scrollbar`}>


{focus === pickingGameType && (
  <div className={`flex creatinggameview-choosingSettings-container  ${hasCurrentTables ? '' : ' extended'}`}>

            <div className="creatinggameview-settings-header flex center">
              <div className="creatinggameview-settings-header-text flex center">
                Choose Game Type
              </div>
            </div>

          <div className={`creatinggameview-isPickingGameType-container styled-scrollbar ${hasCurrentTables ? '' : ' extended'} flex center`}>
            {allGames &&
              Object.values(allGames).map((game, index) => (
                
                
                <div key={index} className={`creatinggameview-gametile-wrapper ${animateTiles ? 'animate' : ''}`} style={{animationDelay: `${index * 0.15}s`}} >
                  <GameTile game={game} cbFunc={gameSelect}  />
                </div>

              ))}
          </div>

  </div>

      )}


{focus === choosingSettings && (
  <div className={`flex creatinggameview-choosingSettings-container ${hasCurrentTables ? '' : ' extended'}`}>


        <div className="creatinggameview-settings-header flex center">
          
          <div className="creatinggameview-settings-header-text flex center">
            {displayGameType} Settings
          </div>
        </div>

        <div className={`creatinggameview-settings-options styled-scrollbar flex`}>





{/* Private game option */}
          <div className='creatinggameview-settings-option flex center'>
            <div className='creatinggameview-settings-option-header flex center'>
              Private Game?
            </div>
            <div className='creatinggameview-settings-button-container flex center'>
              <div className='creatinggameview-settings-option-button flex center'>
                <div className='creatinggameview-button-header'>
                  Yes
                </div>  
                <div 
                onClick={()=>{
                  setIsPrivate(true)
                  privateKeyInputRef.current.focus();
                  }} 
                  className='creatinggameview-button-button flex center'>
                  {isPrivate && <i className="fa-solid fa-check priority"></i>}
                </div>
              </div>
              <div className='creatinggameview-settings-option-button flex center'>
                <div className='creatinggameview-button-header'>
                  No
                </div>  
                <div onClick={()=>setIsPrivate(false)} className='creatinggameview-button-button flex center'>
                {!isPrivate && <i className="fa-solid fa-check priority"></i>}
                </div>
              </div>
            </div>
          </div>

{/* Private game passcode option */}
          <div className='creatinggameview-settings-option flex center'>
            <div className={`creatinggameview-settings-option-header flex center ${isPrivate ? '' : ' grey'}`}>
              Private Key
            </div>
            <div className='creatinggameview-settings-button-container flex center'>
              <form 
                onSubmit={(e)=>{
                  e.preventDefault()
                  return
                }} 
                className={`creatinggameview-name flex center`}
                >


                <input
                  ref={privateKeyInputRef}
                  className={`creatinggameview-chatname ${isPrivate ? '' : ' grey'}`}
                  type="text"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  required
                  placeholder={privateKeyValidationErrors['privateKey'] || ''}
                />

                <button style={{display: 'none'}}></button>


              </form>
            </div>
          </div>



{/* Number of decks game option */}
          <div className='creatinggameview-settings-option flex center'>
            <div className='creatinggameview-settings-option-header flex center'>
              Number of decks?
            </div>
            <div className='creatinggameview-settings-button-container flex center'>
              <div className='creatinggameview-settings-option-button flex center'>
                <div className='creatinggameview-button-header'>
                  1
                </div>  
                <div onClick={()=>{
                  setDeckSize(1)
                  setBetSizing(null)
                  }} className='creatinggameview-button-button flex center'>
                  {deckSize === 1 && <i className="fa-solid fa-check priority"></i>}
                </div>
              </div>
              <div className='creatinggameview-settings-option-button flex center'>
                <div className='creatinggameview-button-header'>
                  4
                </div>  
                <div onClick={()=>{
                  setDeckSize(4)
                  setBetSizing(null)
                  }} className='creatinggameview-button-button flex center'>
                {deckSize === 4 && <i className="fa-solid fa-check priority"></i>}
                </div>
              </div>
              <div className='creatinggameview-settings-option-button flex center'>
                <div className='creatinggameview-button-header'>
                  6
                </div>  
                <div onClick={()=>{
                  setDeckSize(6)
                  setBetSizing(null)
                  }} className='creatinggameview-button-button flex center'>
                {deckSize === 6 && <i className="fa-solid fa-check priority"></i>}
                </div>
              </div>
            </div>
          </div>


{/* Number of decks game option */}
<div className='creatinggameview-settings-option flex center'>
            <div className='creatinggameview-settings-option-header flex center'>
              Min/Max Bets?
            </div>
            <div className='creatinggameview-settings-button-container flex center'>
  
            {
              blackjackObj[deckSize] && blackjackObj[deckSize].betSizes
                ? blackjackObj[deckSize].betSizes.map((sizing, index) => (
                  <div 
                  key={index} 
                  className='creatinggameview-settings-option-button flex center'
                  >
                    <div className='creatinggameview-button-header bet-sizing'>
                    {sizing.minBet}/{sizing.maxBet}
                    </div>  
                    <div onClick={() => setBetSizing(sizing)} className='creatinggameview-button-button flex center'>
                    {betSizing && sizing &&
                    betSizing.maxBet == sizing.maxBet &&
                    betSizing.minBet == sizing.minBet &&
                    <i className="fa-solid fa-check priority"></i>}
       
                    </div>
                  </div>
                  ))
                : null
            }
            </div>
          </div>
        </div>
  </div>


      )}

{focus === invitingFriends && (
        <div className={`flex creatinggameview-choosingSettings-container ${hasCurrentTables ? '' : ' extended'}`}>

            <div className="creatinggameview-settings-header flex center">
              <div className="creatinggameview-settings-header-text flex center">
                  Invite Some Friends
              </div>
            </div>


          <div className='creatinggameview-friendtiles-container styled-scrollbar'>
            {friends &&
              Object.entries(friends.friends).map(([key, friend], index) => {
                return (
                  <div  key={index} className='creatinggameview-friendtile-wrapper'>
                    <FriendTile key={index} friend={friend} type={'invite-to-conversation'} cb={handleList} isInvited={friendList[friend?.id]} />
                  </div>
                );
              })}
          </div>
        </div>
      )}


{focus === reviewingGameOptions && (
            <div className={`flex creatinggameview-choosingSettings-container ${hasCurrentTables ? '' : ' extended'}`}>


              <div className="creatinggameview-settings-header flex center">
                <div className="creatinggameview-settings-header-text flex center">
                  Review and Start
                </div>
              </div>

              <div className='creatinggameview-review-wrapper styled-scrollbar'>

              <div className='creatinggameview-review-option flex center'>
                <div className='creatinggameview-settings-option-header flex center'>
                  Game Type - {displayGameType}
                </div>
              </div>

              <div className='creatinggameview-review-option flex center'>
                <div className='creatinggameview-settings-option-header flex center'>
                  Private Game - {isPrivate ? 'Yes' : 'No'}
                </div>
              </div>
              
{ isPrivate && <div className='creatinggameview-review-option flex center'>
                  <div className='creatinggameview-settings-option-header flex center'>
                    <div>Private Key - </div>
                    { !privateWarning && <div>{privateKey}</div>}
                    { privateWarning && 

                    <div className='flex'>   
                      <div 
                        onClick={()=>{
                          setFocus(choosingSettings)
                          setTimeout(() => {
                            privateKeyInputRef.current.focus();
                          }, 500);
                        }} 
                        className={`creatinggameview-settings-selection flex center ${privateWarning ? ' red' : ' '}`}>
                        {'None '}
                      </div>
                      <div className='creatinggameview-noprivatekey'>{'(table will be set to open)'}</div>
                    </div>

                    
                    }
                    

                  </div>
                </div>
                }


              <div className='creatinggameview-review-option flex center'>
                <div className='creatinggameview-settings-option-header flex center'>
                  Number of Decks - {deckSize}
                </div>
              </div>

              <div className='creatinggameview-review-option flex center'>
                  <div className={`creatinggameview-settings-option-header flex center`}>
                  {`Min/Max Bets -  `}

                  <div onClick={()=>setFocus(choosingSettings)} className={`creatinggameview-settings-selection flex center ${betSizing ? '' : ' red'}`}>

                      {
                          betSizing?.minBet && betSizing?.maxBet 
                              ? `${betSizing.minBet}/${betSizing.maxBet}`
                              : `None`
                      }

                  </div>


                  </div>
              </div>
              


              {friendList && Object.values(friendList).length === 0 && 
                                    <div className='creatinggameview-nofriends-option flex center'>
                                    <div className='creatinggameview-settings-option-header nofriends flex center'>
                                      No friends invited.
                                    </div>
                                      <div onClick={()=>setFocus(invitingFriends)} className='creatinggameview-invitefriends-button'>Invite friends?</div>
                                  </div>
                    }
              {friendList && Object.values(friendList).length > 0 && 
              <div className='creatinggameview-friends-option styled-scrollbar flex center'>
                      {friendList && Object.values(friendList).length > 0 && 
                      Object.entries(friendList).map(([key,friend],index)=>{
                        return(
                          <FriendTile key={index} friend={friend} type={'invited-to-table'} cb={handleList} isInvited={friendList[friend?.id]} />
                        )
                      })}
              </div>
                    }


              <div className='creatinggameview-start-option flex center'>
                <div onClick={createTable} className={buttonClass}>
                  Start Table
                </div>
              </div>





          </div>
          </div>
      )}




        
      </div>
    </div>
    </div>
  );
};
export default CreatingGameView;
