import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './TableSeat.css'
import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';

const TableSeat = ({seatNumber, player}) => {

  const dispatch = useDispatch()
  const activeTable = useSelector(state=>state.games.activeTable)
  const currentTables = useSelector(state=>state.games.currentTables)
  const user = useSelector(state => state.users.user)
  const balance = useSelector(state => state.users.balance)
  const {socket} = useContext(SocketContext)
  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);

  const [disconnectTimer, setDisconnectTimer] = useState(0)
  const [totalBet, setTotalBet] = useState(0)
  const [currentBalance, setCurrentBalance] = useState(0)



  useEffect(() => {

    let userDisconnectTimer = currentTables[activeTable.id]?.tableUsers[seatNumber]?.disconnectTimer;
    let userPendingBet = currentTables[activeTable.id]?.tableUsers[seatNumber]?.pendingBet;
    let userCurrentBalance = currentTables[activeTable.id]?.tableUsers[seatNumber]?.tableBalance;

    setTotalBet(userPendingBet)
    setCurrentBalance(userCurrentBalance)
    if (userDisconnectTimer > 0) {
      setDisconnectTimer(userDisconnectTimer / 1000);
    }
  }, [currentTables, activeTable.id, seatNumber]);
  

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
    setUpdateObj({seatNumber, tableBalance:player.tableBalance})
    openModal('leaveModal')
  }

  // console.log(player);

 

return(

    <div className={`seat-container six-ring seat${seatNumber}`}>
      {disconnectTimer > 0 && (<div className='disconnect-timer flex center'>{disconnectTimer}s</div>)}
      <div className='total-bet flex center'>bet:{totalBet}</div>
      <div className='table-balance flex center'>${currentBalance}</div>
      <button onClick={takeSeat}>Take seat</button>
      {player && (
        <>
          <div>{player?.username ? player.username : ' anon'}</div>
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