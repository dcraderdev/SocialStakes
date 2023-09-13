import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './TableSeat.css'
import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';
import { WindowContext } from '../../context/WindowContext';

import Card from '../Card'
import cardConverter from '../../utils/cardConverter';
import handSummary from '../../utils/handSummary';

import Searching from '../../images/Searching.svg'
import pokerChip from '../../images/poker-chip.svg'
import pokerChipWithDollarSign from '../../images/poker-chip-with-dollar-sign.svg'
import PokerChip from '../PokerChip';

import bluePokerChip from '../../images/blue_chip.png'



const TableSeat = ({seatNumber}) => {
  const {socket} = useContext(SocketContext)
  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);
  const { windowWidth, windowHeight } = useContext(WindowContext); // use the windowWidth value from your context

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
  const [allCurrentBets, setAllCurrentBets] = useState(0)
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
  const [testBets, aaaaaa] = useState([1]);

  const [testCards, bbbbb] = useState({1:{cards:[1,1,1,1]},2:{cards:[1,1]},3:{cards:[1,1]},4:{cards:[1,1]}});
  // const [testCards, bbbbb] = useState({});
  // const [testCards, bbbbb] = useState({1:{cards:[1,1,1,1]},2:{cards:[1,1]}});
  
  // const [testCards, bbbbb] = useState({1:{cards:[1,1,1,1]}});


  const [tableBalance, setTableBalance] = useState(0)
  const [beforeHandBalance, setBeforeHandBalance] = useState(0)
  const [winnings, setWinnings] = useState(0)



  useEffect(() => {
    const image = new Image();
    image.src = bluePokerChip;
  }, []);







useEffect(()=>{
  setTableBalance(0)
  if(activeTable && user && currentTables && currentTables?.[activeTable.id]?.tableUsers){
  Object.values(currentTables?.[activeTable.id]?.tableUsers).map(seat=>{
    if(seat.userId === user.id){
      setTableBalance(seat.tableBalance)
    }
  })
}
}, [currentTables, activeTable])







useEffect(()=>{

  if(isHandInProgress){
    setBeforeHandBalance(tableBalance)
  }

  if(!isHandInProgress){
    setInsuranceBet(null)
    if(tableBalance > beforeHandBalance){
      setWinnings(tableBalance - beforeHandBalance)
    }
  }





}, [tableBalance, isHandInProgress])




    // if(currTable.dealerCards){
    //    let summary = handSummary(currTable.dealerCards)
    //   setHandValues(summary.values.join(','))
    // }




  useEffect(() => {
    if(currentTables && activeTable && currentTables?.[activeTable.id]?.tableUsers){
      if( currentTables[activeTable.id].tableUsers[seatNumber]){
        setPlayer(currentTables[activeTable.id].tableUsers[seatNumber]);
      } else {
        setPlayer(null);
      }
    }

  }, [currentTables, activeTable, seatNumber]);


  useEffect(() => {

    if (!activeTable || !currentTables || !currentTables[activeTable.id]) {
      return;
    }

    let countdownInterval = null;
    let countdownRemaining = Math.ceil((currentTables[activeTable.id].actionEndTimeStamp - Date.now()) / 1000);

    let currUser = currentTables[activeTable.id]?.tableUsers?.[seatNumber]

    let userDisconnectTimer = currUser?.disconnectTimer;
    let userPendingBet = currUser?.pendingBet;
    let userInsuranceBet = currUser?.insurance;
    let userCurrentBet = currUser?.currentBet;
    let userCurrentBalance = currUser?.tableBalance;
    let userCards = currUser?.cards;
    let userHands = currUser?.hands;
    let userForfeited = currUser?.forfeit;



    setPendingBet(userPendingBet)
    setCurrentBet(userCurrentBet)
    setCards(userCards)
    setHands(userHands)
    setIsForfeited(userForfeited)
    
    
    if (userCurrentBalance) {
      setCurrentBalance(userCurrentBalance)
    }

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


    if(hands && actionHand && hands[actionHand] && hands[actionHand].cards){

      

      let summary = handSummary(hands[actionHand].cards)

      if(summary && summary.values){
        setHandValues(summary.values.join(','))
      }

      // setHandValues(hands[actionHand].summary.values.join(','))


    }


    setIsCurrentUser(userInSeat);
    setIsUserInAnySeat(userInAnySeat);
    setIsActiveSeat(userInActiveSeat)
    setIsHandInProgress(handInProgress)
    setActionHand(currActionHand)
  }, [currentTables, activeTable.id, seatNumber, user, hands]);




  useEffect(() => {
    setAllCurrentBets(null)
    if(hands){
      let allBets = []
      Object.entries(hands).map(([key,value],index)=>{
        allBets.push(value.bet)
      })
      setAllCurrentBets(allBets)
    }
  }, [hands]);



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


  const takeSeat = () => {
    if(!user) return
    if(player || isUserInAnySeat) return


    if(currentTables && activeTable){


      console.log(currentTables[activeTable.id]);

      let currMinBet = currentTables[activeTable.id].Game.minBet
      setUpdateObj({minBet:currMinBet, seatNumber, type:'initDeposit'})
      openModal('balanceModal')
    }
  }

  const leaveSeat = () => {

    if(!isCurrentUser) return

    setUpdateObj({seat:seatNumber, tableId:activeTable.id})
    openModal('leaveModal')
    return
  }


  const getCardOffsetStyle = (cardIndex, handId) => {

    const isActionHand = handId === actionHand
    const offsetValueA = 5;
    const offsetValueB = 25;

    // Base Style
    let baseStyle = {
      position: 'absolute',
      zIndex: cardIndex,
      // left: `${cardIndex * (offsetValueB)}px`,
      // top: `${cardIndex * -offsetValueA}px`,
    };
    if(isActionHand){
    }
    
    return {
      ...baseStyle,
      top: `${cardIndex * offsetValueB}px`,
      left: `${cardIndex * (offsetValueA)}px`,

    };

  };


return(

    <div className={`seat-wrapper seat${seatNumber} flex center`}>
      <div className={`seat-container flex center ${!player ? ' border' : ''}`}>


<div className='tableseat-bet-area flex center'>
      {disconnectTimer > 0 && (<div className='disconnect-timer flex center'>{disconnectTimer}s</div>)}
      {actionTimer > 0 && isActiveSeat && (<div className='turn-timer flex center'>{actionTimer}s</div>)}


        {pendingBet > 0 &&             
          <div className='pokerchip-wrapper'>
            <PokerChip amount={pendingBet}/>
          </div>
        }

{allCurrentBets?.length > 0 && allCurrentBets.map((bet, index) => (
        <div key={index} className={`pokerchip-wrapper`}>
          <PokerChip amount={bet}/>
        </div>
      ))}


      {/* {testBets.length > 0 && testBets.map((bet, index) => (
        <div className='pokerchip-wrapper'>
          <PokerChip amount={bet}/>
        </div>
      ))} */}

</div>


        {insuranceBet > 0 && (       
          <div className='insurance-bet-area flex center'>
            <div className='pokerchip-wrapper'>
              <PokerChip amount={insuranceBet}/>
            </div>
          </div>
        )}


        {player && (

          <div 
          className={`tableseat-hands-container flex`}
          // style={getSplitOffsetStyle()} 
          >
            
            {hands && Object.entries(hands).map(([handId, handData],index) => (
              
              <div className={`tableseat-hand-container flex center `} key={handId}>


        {  handId === actionHand &&      <div className={`tableseat-hand-value flex center ${neonTheme}-text`}>
          {handValues}
        </div>
        }

                <div className={`tableseat-hand-cards flex center ${handId === actionHand ? ' bigger' : ''}`} key={handId}>
                  {handData.cards.map((card, index) => (
                        <div 
                        className={`cardarea-card-container`} 
                        style={getCardOffsetStyle(index, handId)} 
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
      </div>


      {player && (
        <div className={`profile-container flex center`}>
          <div className='profileimage-wrapper flex center'>
            <div onClick={leaveSeat} className={`profileimage-container flex center ${isActiveSeat ? ' gold' : ''}`}>
              <div className='profileimage-sub-container flex center'>
                    <div className='profileimage-image flex center'><i className="fa-regular fa-user"></i></div>
              </div>
            </div>
          </div>
          <div className='seat-namebalance-container flex'>
            <div className={`${neonTheme}-text name-space`}>{player.username}</div>
            <div className={`seat-tablebalance flex center ${neonTheme}-text`}>${currentBalance}</div>
          </div>
        </div>
      )}


{!player && (
       <div  onClick={takeSeat} className={`profile-container flex center`}>
         <div className='profileimage-wrapper flex center'>
           <div className='profileimage-container flex center emptyseat-border'>
             <div className='profileimage-sub-container emptyseat-background flex center'>
                 <div className={`profileimage-takeseat flex center`}>
                   <i className={`fa-solid fa-arrow-down emptyseat-arrow ${neonTheme}-text`}></i>
                 </div>
             </div>
           </div>
         </div>

        <div className='seat-namebalance-container flex'>
            <div className={`${neonTheme}-text name-space`}>{'Take'}</div>
            <div className={`seat-tablebalance take-seat flex center ${neonTheme}-text`}>{'Seat'}</div>
          </div>
       </div>

     )}








    </div>
)
}

  export default TableSeat

