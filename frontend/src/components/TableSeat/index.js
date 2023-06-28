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

console.log(player);

  console.log(seatNumber);

  useEffect(()=>{
    if(currentTables[activeTable.id].tableUsers[seatNumber]){
      let disconnectTimer = currentTables[activeTable.id].tableUsers[seatNumber].disconnectTimer
      console.log(disconnectTimer);
      console.log(currentTables[activeTable.id].tableUsers[seatNumber]);
      if(disconnectTimer > 0){
        setDisconnectTimer(disconnectTimer)
      }
    }
  },[currentTables])

  useEffect(() => {
    let timerId = null;

    if (disconnectTimer > 0) {
      timerId = setInterval(() => {
        setDisconnectTimer((prevTimer) => prevTimer > 0 ? prevTimer - 1000 : 0);
      }, 1000);
    }

    // Cleanup function to clear the interval when component is unmounted or when disconnectTimer is updated.
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [disconnectTimer]);



  const takeSeat = () => {
    if(!user) return
    setUpdateObj({minBet:activeTable.Game.minBet, seatNumber})
    openModal('balanceModal')

  }



  const leaveSeat = () => {
    setUpdateObj({seatNumber, tableBalance:player.tableBalance})
    openModal('leaveModal')
  }

  // console.log(player);

 

return(

    <div className={`seat-container six-ring seat${seatNumber}`}>
      {disconnectTimer > 0 && (<div className='disconnect-timer flex center'>{disconnectTimer}</div>)}
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