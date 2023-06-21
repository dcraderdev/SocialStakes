import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './TableSeat.css'
import * as gameActions from '../../redux/middleware/games';


const TableSeat = ({seatNumber, player}) => {

  const dispatch = useDispatch()
  const table = useSelector(state=>state.games.activeTable)

  const takeSeat = () => {
  console.log(seatNumber);
    
    dispatch(gameActions.takeSeat(table.id, seatNumber))
  }

  const leaveSeat = () => {
    dispatch(gameActions.leaveSeat(table.id, seatNumber))
  }


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