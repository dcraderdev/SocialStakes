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
  const [turnTimer, setTurnTimer] = useState(0)
  const [pendingBet, setPendingBet] = useState(0)
  const [currentBet, setCurrentBet] = useState(0)
  const [currentBalance, setCurrentBalance] = useState(0)

  const [cards, setCards] = useState([]);
  const [valueOfHand, setValueOfHand] = useState([]);


  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isUserInAnySeat, setIsUserInAnySeat] = useState(false);
  const [isActiveSeat, setIsActiveSeat] = useState(false);
  const [isHandInProgress, setIsHandInProgress] = useState(false);
  



  useEffect(() => {

    let userDisconnectTimer = currentTables[activeTable.id]?.tableUsers[seatNumber]?.disconnectTimer;
    let userTurnTimer = currentTables[activeTable.id]?.tableUsers[seatNumber]?.turnTimer;
    let userPendingBet = currentTables[activeTable.id]?.tableUsers[seatNumber]?.pendingBet;
    let userCurrentBet = currentTables[activeTable.id]?.tableUsers[seatNumber]?.currentBet;
    let userCurrentBalance = currentTables[activeTable.id]?.tableUsers[seatNumber]?.tableBalance;
    let userCards = currentTables[activeTable.id]?.tableUsers[seatNumber]?.cards;

    console.log(currentTables[activeTable.id]?.tableUsers[seatNumber]);

    setPendingBet(userPendingBet)
    setCurrentBet(userCurrentBet)
    setCurrentBalance(userCurrentBalance)
    setCards(userCards)
    if (userDisconnectTimer > 0) {
      setDisconnectTimer(userDisconnectTimer / 1000);
    }
    if (userTurnTimer > 0) {
      setTurnTimer(userTurnTimer / 1000);
    }
  }, [currentTables, activeTable.id, seatNumber]);
  

  useEffect(() => {
    let userInAnySeat = Object.values(currentTables[activeTable.id]?.tableUsers || {}).some(seat => seat.username === user.username);
    let currentUserInSeat = currentTables[activeTable.id]?.tableUsers[seatNumber]?.username === user.username;
    let userInActiveSeat = currentTables[activeTable.id]?.actionSeat === seatNumber;
    let handInProgress = currentTables[activeTable.id]?.handInProgress;

    setIsCurrentUser(currentUserInSeat);
    setIsUserInAnySeat(userInAnySeat);
    setIsActiveSeat(userInActiveSeat)
    setIsHandInProgress(handInProgress)
  }, [currentTables, activeTable.id, seatNumber, user]);






  useEffect(() => {
    let timerId = null;
  
    if (disconnectTimer > 0) {
      timerId = setInterval(() => {
        setDisconnectTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
  
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [disconnectTimer]);


  const takeSeat = () => {
    if(!user) return
    setUpdateObj({minBet:activeTable.Game.minBet, seatNumber, type:'initDeposit'})
    openModal('balanceModal')
  }



  const leaveSeat = () => {
    let tableBalance = pendingBet + currentBalance
    setUpdateObj({seatNumber, tableBalance})
    openModal('leaveModal')
  }

  // console.log(player);

//  console.log(isActiveSeat);
//  console.log(currentTables[activeTable.id]);

return(

    <div className={`seat-container six-ring seat${seatNumber} ${isActiveSeat ? ' gold' : ''}`}>

      {disconnectTimer > 0 && (<div className='disconnect-timer flex center'>{disconnectTimer}s</div>)}
      {turnTimer > 0 && (<div className='turn-timer flex center'>{turnTimer}s</div>)}

      {player && (
        <div>
          <div className='seat-card-area'>
            {cards && cards.map((card, index) => <Card key={index} card={card} />)}
          </div>
          <div className='flex center'>user:{player?.username ? player.username : ''}</div>
          <div className='total-bet flex center'>pending bet:{pendingBet}</div>
          <div className='total-bet flex center'>current bet:{currentBet}</div>
          <div className='table-balance flex center'>${currentBalance}</div>
        </div>
      )}



      {!player && !isCurrentUser && !isUserInAnySeat && (
        <button onClick={takeSeat}>Take seat</button>
      )}
      {player && isCurrentUser && (
        <>
          <button onClick={leaveSeat}>Leave seat</button>
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