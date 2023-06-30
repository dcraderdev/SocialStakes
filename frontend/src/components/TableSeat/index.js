import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './TableSeat.css'
import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';

import Card from '../Card'

const TableSeat = ({seatNumber, player}) => {

  const dispatch = useDispatch()
  const activeTable = useSelector(state=>state.games.activeTable)
  const currentTables = useSelector(state=>state.games.currentTables)
  const user = useSelector(state => state.users.user)
  const balance = useSelector(state => state.users.balance)
  const {socket} = useContext(SocketContext)
  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);

  const [disconnectTimer, setDisconnectTimer] = useState(0)
  const [pendingBet, setPendingBet] = useState(0)
  const [currentBet, setCurrentBet] = useState(0)
  const [currentBalance, setCurrentBalance] = useState(0)


  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isUserInAnySeat, setIsUserInAnySeat] = useState(false);
  const [cards, setCards] = useState([]);





  useEffect(() => {

    let userDisconnectTimer = currentTables[activeTable.id]?.tableUsers[seatNumber]?.disconnectTimer;
    let userPendingBet = currentTables[activeTable.id]?.tableUsers[seatNumber]?.pendingBet;
    let userCurrentBet = currentTables[activeTable.id]?.tableUsers[seatNumber]?.currentBet;
    let userCurrentBalance = currentTables[activeTable.id]?.tableUsers[seatNumber]?.tableBalance;
    let userCards = currentTables[activeTable.id]?.tableUsers[seatNumber]?.cards;

    setPendingBet(userPendingBet)
    setCurrentBet(userCurrentBet)
    setCurrentBalance(userCurrentBalance)
    setCards(userCards)
    if (userDisconnectTimer > 0) {
      setDisconnectTimer(userDisconnectTimer / 1000);
    }
  }, [currentTables, activeTable.id, seatNumber]);
  

  useEffect(() => {
    let userInAnySeat = Object.values(currentTables[activeTable.id]?.tableUsers || {}).some(seat => seat.username === user.username);

    let currentUserInSeat = currentTables[activeTable.id]?.tableUsers[seatNumber]?.username === user.username;
    setIsCurrentUser(currentUserInSeat);
    setIsUserInAnySeat(userInAnySeat);
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







// let arr = [1,1,1,1,1]
// let hash = {}

// for(let i of arr){
//   if(hash[arr[i]]){
//     hash[arr[i]] += 1
//   }else {
//     hash[arr[i]] = 1
//   }
// } 



// console.log(hash);
// console.log(arr.length);
















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

 

return(

    <div className={`seat-container six-ring seat${seatNumber}`}>

      {disconnectTimer > 0 && (<div className='disconnect-timer flex center'>{disconnectTimer}s</div>)}

      {player && (
        <div>
          <div className='seat-card-area'>
            {cards && cards[0] && <Card card={cards[0]}/>}
            {cards && cards[1] && <Card card={cards[1]}/>}
            {/* <Card card={cards[1]}/> */}
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