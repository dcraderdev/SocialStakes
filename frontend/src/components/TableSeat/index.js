import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './TableSeat.css'
import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';
import { WindowContext } from '../../context/WindowContext';

import Card from '../Card'
import cardConverter from '../../utils/cardConverter';
import Searching from '../../images/Searching.svg'
import pokerChip from '../../images/poker-chip.svg'
import pokerChipWithDollarSign from '../../images/poker-chip-with-dollar-sign.svg'


const TableSeat = ({seatNumber}) => {
  const {socket} = useContext(SocketContext)
  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);
  const { windowWidth } = useContext(WindowContext); // use the windowWidth value from your context

  const dispatch = useDispatch()
  const activeTable = useSelector(state=>state.games.activeTable)
  const currentTables = useSelector(state=>state.games.currentTables)
  const user = useSelector(state => state.users.user)
  const balance = useSelector(state => state.users.balance)
  const neonTheme = useSelector(state=>state.users.neonTheme)
  const tableTheme = useSelector(state=>state.users.tableTheme)

  const [disconnectTimer, setDisconnectTimer] = useState(0)
  const [actionTimer, setActionTimer] = useState(0)
  const [pendingBet, setPendingBet] = useState(0)
  const [currentBet, setCurrentBet] = useState(0)
  const [insuranceBet, setInsuranceBet] = useState(0)
  const [currentBalance, setCurrentBalance] = useState(0)

  const [cards, setCards] = useState([]);
  const [hands, setHands] = useState([]);
  const [handValues, setHandValues] = useState(null);


  const [player, setPlayer] = useState(null);


  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isUserInAnySeat, setIsUserInAnySeat] = useState(false);
  const [isActiveSeat, setIsActiveSeat] = useState(false);
  const [actionHand, setActionHand] = useState(null);
  const [isHandInProgress, setIsHandInProgress] = useState(false);
  const [isForfeited, setIsForfeited] = useState(false);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    if(currentTables && activeTable && currentTables[activeTable.id].tableUsers){
      if( currentTables[activeTable.id].tableUsers[seatNumber]){
        setPlayer(currentTables[activeTable.id].tableUsers[seatNumber]);
      } else {
        setPlayer(null);
      }
    }

  }, [currentTables, activeTable, seatNumber]);




  useEffect(() => {
    let newScale = windowWidth / 600

    if(newScale > 1){
      newScale = 1
    } else if(newScale< 0.5){
      newScale = 0.5
    }

    setScale(newScale)

    

  }, [windowWidth]);







  useEffect(() => {

    if (!activeTable || !currentTables || !currentTables[activeTable.id]) {
      return;
    }

    let countdownInterval = null;
    let countdownRemaining = Math.ceil((currentTables[activeTable.id].actionEnd - Date.now()) / 1000);


    let userDisconnectTimer = currentTables[activeTable.id]?.tableUsers?.[seatNumber]?.disconnectTimer;
    let userPendingBet = currentTables[activeTable.id]?.tableUsers?.[seatNumber]?.pendingBet;
    let userInsuranceBet = currentTables[activeTable.id]?.tableUsers?.[seatNumber]?.insurance;
    let userCurrentBet = currentTables[activeTable.id]?.tableUsers?.[seatNumber]?.currentBet;
    let userCurrentBalance = currentTables[activeTable.id]?.tableUsers?.[seatNumber]?.tableBalance;
    let userCards = currentTables[activeTable.id]?.tableUsers?.[seatNumber]?.cards;
    let userHands = currentTables[activeTable.id]?.tableUsers?.[seatNumber]?.hands;
    let userForfeited = currentTables[activeTable.id]?.tableUsers?.[seatNumber]?.forfeit;
  
    console.log(userHands);
    setPendingBet(userPendingBet)
    setCurrentBet(userCurrentBet)
    setCurrentBalance(userCurrentBalance)
    setCards(userCards)
    setHands(userHands)
    setIsForfeited(userForfeited)

    if (userInsuranceBet && userInsuranceBet.bet) {
      setInsuranceBet(userInsuranceBet.bet)
    }


    if (userDisconnectTimer > 0) {
      setDisconnectTimer(userDisconnectTimer / 1000);
    }


    if (countdownRemaining > 0) {
      setActionTimer(countdownRemaining);
      countdownInterval = setInterval(() => {
        setActionTimer((prevCountdown) => prevCountdown && prevCountdown > 1 ? prevCountdown - 1 : null);
      }, 1000);
    } else {
      setActionTimer(null);
    }
  
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };



  }, [currentTables, activeTable, seatNumber]);



  useEffect(() => {

    let userInAnySeat = Object.values(currentTables[activeTable.id]?.tableUsers || {}).some(seat => seat.username === user.username);
    let userInSeat = currentTables[activeTable.id]?.tableUsers?.[seatNumber]?.username === user.username;
    let userInActiveSeat = currentTables[activeTable.id]?.actionSeat === seatNumber;
    let handInProgress = currentTables[activeTable.id]?.handInProgress;
    let currActionHand = currentTables[activeTable.id]?.actionHand;


    if(hands && actionHand && hands[actionHand]){
      setHandValues(hands[actionHand].summary.values.join(','))
    }

    setIsCurrentUser(userInSeat);
    setIsUserInAnySeat(userInAnySeat);
    setIsActiveSeat(userInActiveSeat)
    setIsHandInProgress(handInProgress)
    setActionHand(currActionHand)
  }, [currentTables, activeTable.id, seatNumber, user]);



  useEffect(() => {
    let disconnectTimerId = null;

  
    if (disconnectTimer > 0) {
      disconnectTimerId = setInterval(() => {
        setDisconnectTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
  
    return () => {
      if (disconnectTimerId) clearInterval(disconnectTimerId);
    };
  }, [disconnectTimer]);


  // useEffect(() => {
  //   let actionTimerId = null;

  
  //   if (actionTimer > 0) {
  //     actionTimerId = setInterval(() => {
  //       setActionTimer((prevTimer) => prevTimer - 1);
  //     }, 1000);
  //   }
  
  //   return () => {
  //     if (actionTimerId) clearInterval(actionTimerId);
  //   };
  // }, [actionTimer]);





  const takeSeat = () => {
    if(!user) return
    if(player || isUserInAnySeat) return


    if(currentTables && activeTable){
      let currMinBet = currentTables[activeTable.id].Game.minBet
      setUpdateObj({minBet:currMinBet, seatNumber, type:'initDeposit'})
      openModal('balanceModal')
    }
  }



  const leaveSeat = () => {
    setUpdateObj({seat:seatNumber, tableId:activeTable.id})
    openModal('leaveModal')
    return
  }

  const getOffset = (index) => {

  }

  const getOffsetStyle = (index, isActive) => {
    const offsetValue = 20;
  
    let baseStyle = {
      position: 'absolute',
      left: `${index * offsetValue}px`,
    };
  
    if (seatNumber >= 4 && seatNumber <= 6) {
      baseStyle = {
        ...baseStyle,
        left: `${index * -offsetValue}px`,
      };
    }
  
    if (isActive) {
      baseStyle = {
        ...baseStyle,
        transform: "scale(1.2)",
        zIndex: 100000,
      };
    }
  
    return baseStyle;
  };


  const getCardOffsetStyle = (cardIndex, isSeatOnLeftSide) => {
    const offsetValueA = 20;
    const offsetValueB = 10;
  
    let baseStyle = {
      position: 'absolute',
      zIndex: cardIndex,
      left: `${cardIndex * (offsetValueB)}px`,
      top: `${cardIndex * -offsetValueA}px`,
    };
  
    if (!isSeatOnLeftSide) {
      baseStyle = {
        ...baseStyle,
        left: `${cardIndex * -offsetValueB}px`,
      };
    }
  
    return baseStyle;
  };
  
  

  const getSplitOffset = (numSplits, isSeat3) => {
    // Change this value to adjust the offset per split
    const offsetPerSplit = 15;
    
    return numSplits * (isSeat3 ? -offsetPerSplit : offsetPerSplit);
  }
  


 let fakeBet = 1

return(

    <div style={{ transform: `scale(${scale})` }} onClick={takeSeat} className={`seat-wrapper flex center seat seat${seatNumber} ${!player ? ' border' : ''}`}>

      {disconnectTimer > 0 && (<div className='disconnect-timer flex center'>{disconnectTimer}s</div>)}
      {actionTimer > 0 && isActiveSeat && (<div className='turn-timer flex center'>{actionTimer}s</div>)}

      {player && (
                
        <div className={`seat-container flex center`}>






{       pendingBet > 0 &&             <div className='pending-bet-area flex center'>
                      <div className='currentbet-chip-container flex center'>
                        <img className='currentbet-chip' src={pokerChipWithDollarSign} alt='searching'></img>
                      </div>
                      {pendingBet}
                    </div>}

                    {insuranceBet > 0 && (       
                    <div className='insurance-bet-area flex center'>
                      <div className='currentbet-chip-container flex center'>
                        <img className='currentbet-chip' src={pokerChipWithDollarSign} alt='poker chip'></img>
                      </div>
                      {insuranceBet}
                    </div>
                  )}


                    


          <div className='profileimage-wrapper flex center'>
            <div onClick={leaveSeat} className={`profileimage-container flex center ${isActiveSeat ? ' gold' : ''}`}>
              <div className='profileimage-sub-container flex center'>
                    <div className='profileimage-image flex center'><i className="fa-regular fa-user"></i></div>
              </div>
            </div>
          </div>

        <div className='seat-namebalance-container flex center'>
          <div className={`seat-tablebalance flex center ${neonTheme}-text`}>${currentBalance}</div>
        </div>
          <div className={`${neonTheme}-text name-space flex center`}>{player.username}</div>
          {isForfeited && <div className='table-balance flex center'>Forfeited</div>}

        </div>

      )}


{player && (

            <div 
            className={`seat-card-area-container flex ${seatNumber === 1 || seatNumber === 2 ? 'left-side' : ''}`}
            >



              
              {hands && Object.entries(hands).map(([handId, handData],index) => (
                
                <div className={`seat-card-area flex center `} key={handId}>

                    <div className='seat-bet-area flex center'>
                      <div className='currentbet-chip-container flex center'>
                        <img className='currentbet-chip' src={pokerChipWithDollarSign} alt='poker chip'></img>
                      </div>
                      {handData.bet}
                    </div>


                    
                  <div className={`card-area flex ${seatNumber <= 3 ? 'cardarea-left' : 'cardarea-right'} ${handId === actionHand ? ' gold ' : ''}`} key={handId}>

                    {handData.cards.map((card, index) => (
                          <div 
                          className={`cardarea-card-container`} 
                          style={getCardOffsetStyle(index, seatNumber <= 3)} 
                          key={index}
                        >
                        <Card card={card} />
                      </div>
                    ))}
                  </div>


                </div>
                
              ))}

              
            </div>
            )}







      {!player && (
       
                <div className={`seat-container flex`}>
        
      
                  <div className='profileimage-wrapper flex center'>
                    <div className='profileimage-container flex center emptyseat-border'>
                      <div className='profileimage-sub-container emptyseat-background flex center'>

                          <div className={`profileimage-takeseat flex center`}>
                            <i className={`fa-solid fa-arrow-down emptyseat-arrow ${neonTheme}-text`}></i>
                          </div>


                      </div>
                    </div>
                  </div>
        
                <div className='seat-namebalance-container flex center'>
                  <div className={`seat-tablebalance flex center ${neonTheme}-text`}>-</div>
                </div>
                  <div className={` ${neonTheme}-text name-space flex center`}></div>
                  {isForfeited && <div className='table-balance flex center'>Forfeited</div>}
        
                </div>
        
              )}








    </div>
)
}

  export default TableSeat





