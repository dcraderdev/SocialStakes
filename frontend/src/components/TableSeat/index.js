import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './TableSeat.css'
import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';

import Card from '../Card'
import cardConverter from '../../utils/cardConverter';

const TableSeat = ({seatNumber, player}) => {

  const dispatch = useDispatch()
  const activeTable = useSelector(state=>state.games.activeTable)
  const currentTables = useSelector(state=>state.games.currentTables)
  const user = useSelector(state => state.users.user)
  const balance = useSelector(state => state.users.balance)
  const {socket} = useContext(SocketContext)
  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);

  const [disconnectTimer, setDisconnectTimer] = useState(0)
  const [actionTimer, setActionTimer] = useState(0)
  const [pendingBet, setPendingBet] = useState(0)
  const [currentBet, setCurrentBet] = useState(0)
  const [currentBalance, setCurrentBalance] = useState(0)

  const [cards, setCards] = useState([]);
  const [hands, setHands] = useState([]);
  const [valueOfHand, setValueOfHand] = useState([]);


  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isUserInAnySeat, setIsUserInAnySeat] = useState(false);
  const [isActiveSeat, setIsActiveSeat] = useState(false);
  const [actionHand, setActionHand] = useState(null);
  const [isHandInProgress, setIsHandInProgress] = useState(false);
  const [isForfeited, setIsForfeited] = useState(false);


  useEffect(() => {

    let userDisconnectTimer = currentTables[activeTable.id]?.tableUsers[seatNumber]?.disconnectTimer;
    let userActionTimer = currentTables[activeTable.id].actionTimer;
    let userPendingBet = currentTables[activeTable.id]?.tableUsers[seatNumber]?.pendingBet;
    let userCurrentBet = currentTables[activeTable.id]?.tableUsers[seatNumber]?.currentBet;
    let userCurrentBalance = currentTables[activeTable.id]?.tableUsers[seatNumber]?.tableBalance;
    let userCards = currentTables[activeTable.id]?.tableUsers[seatNumber]?.cards;
    let userHands = currentTables[activeTable.id]?.tableUsers[seatNumber]?.hands;
    let userForfeited = currentTables[activeTable.id]?.tableUsers[seatNumber]?.forfeit;

    setPendingBet(userPendingBet)
    setCurrentBet(userCurrentBet)
    setCurrentBalance(userCurrentBalance)
    setCards(userCards)
    setHands(userHands)
    setIsForfeited(userForfeited)

    if (userDisconnectTimer > 0) {
      setDisconnectTimer(userDisconnectTimer / 1000);
    }
    if (userActionTimer > 0) {
      setActionTimer(userActionTimer / 1000);
    }
  }, [currentTables, activeTable.id, seatNumber]);
  

  useEffect(() => {
    let userInAnySeat = Object.values(currentTables[activeTable.id]?.tableUsers || {}).some(seat => seat.username === user.username);
    let userInSeat = currentTables[activeTable.id]?.tableUsers[seatNumber]?.username === user.username;
    let userInActiveSeat = currentTables[activeTable.id]?.actionSeat === seatNumber;
    let handInProgress = currentTables[activeTable.id]?.handInProgress;
    let currActionHand = currentTables[activeTable.id]?.actionHand;

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


  useEffect(() => {
    let actionTimerId = null;
  
    if (actionTimer > 0) {
      actionTimerId = setInterval(() => {
        setActionTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
  
    return () => {
      if (actionTimerId) clearInterval(actionTimerId);
    };
  }, [actionTimer]);




  const takeSeat = () => {
    if(!user) return
    
    if(player || isUserInAnySeat) return
    setUpdateObj({minBet:activeTable.Game.minBet, seatNumber, type:'initDeposit'})
    openModal('balanceModal')
  }



  const leaveSeat = () => {
    console.log(seatNumber);

    let tableBalance = pendingBet + currentBalance
    setUpdateObj({seatNumber, tableBalance})
    openModal('leaveModal')
  }






if(isForfeited){
  return (
    <div onClick={takeSeat} className={`seat-container six-ring seat`}>
    FORFEIT
    </div>
  )
}



return(

    <div onClick={takeSeat} className={`seat-container six-ring seat${seatNumber} ${!player ? ' border' : ''}`}>

      {disconnectTimer > 0 && (<div className='disconnect-timer flex center'>{disconnectTimer}s</div>)}
      {actionTimer > 0 && isActiveSeat && (<div className='turn-timer flex center'>{actionTimer}s</div>)}

      {player && (
                
        <div className={`seat-name-balance-container ${isActiveSeat ? ' gold' : ''}`}>
          <div className='flex center'>{player.username}</div>
          <div className='table-balance flex center'>${currentBalance}</div>
        </div>

      )}


{player && (

            <div className={`seat-card-area-container flex`}>
              {hands && Object.entries(hands).map(([handId, handData]) => (
                <div  className={`seat-card-area flex ${handId === actionHand ? ' gold' : ''}`} key={handId}>
                    {/* <div>Hand ID: {handId}</div> */}
                    <div className='seat-bet-area flex center'>{handData.bet}</div>
                    {handData.cards.map((card, index) => (
                        <Card key={index} card={card} />
                    ))}
                </div>
                
              ))}

              
            </div>
            )}



      {!player && !isCurrentUser && !isUserInAnySeat && (
        <div className='flex center' >Take seat</div>
      )}
      {/* {!player && !isCurrentUser && isUserInAnySeat && (
        <div className='flex center' >Change seat</div>
      )} */}
      {player && isCurrentUser && (
        <>
          <button className='seat-leave-button' onClick={leaveSeat}>Leave seat</button>
        </>
      )}
    </div>
)
}

  export default TableSeat





//   return (
//     <div>player?.username</div>
//   )
// }
// export default TableSeat