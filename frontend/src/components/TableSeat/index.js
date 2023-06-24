import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './TableSeat.css'
import * as gameActions from '../../redux/middleware/games';
import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';

const TableSeat = ({seatNumber, player}) => {

  const dispatch = useDispatch()
  const table = useSelector(state=>state.games.activeTable)
  const user = useSelector(state => state.users.user)
  const {socket} = useContext(SocketContext)
  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);



// console.log(user.balance < table.Game.minBet);

  const takeSeat = () => {
    if(!user) return

    setUpdateObj({minBet:table.Game.minBet, seatNumber})
    openModal('balanceModal')


  //   const {socket} = useContext(SocketContext)

  //   // socket emit the seat taken, tableID, seat number, player info
  // console.log(seatNumber);
  //   const seatObj = {
  //     room: table.id,
  //     seat: seatNumber,
  //     user: user
  //   }
  //   socket.emit('take_seat', seatObj)
    // dispatch(gameActions.takeSeat(seatObj))
  }

  const leaveSeat = () => {
    dispatch(gameActions.leaveSeat(table.id, seatNumber))
  }

  // console.log(player);

 

return(

    <div className={`seat-container six-ring seat${seatNumber}`}>
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