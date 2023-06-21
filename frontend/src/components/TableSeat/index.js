import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './TableSeat.css'

const TableSeat = ({seatNumber, player, onSeatClick, onLeaveClick}) => {


return(

    <div className={`seat-container six-ring seat${seatNumber}`}>
      <button onClick={() => onSeatClick(seatNumber)}>Take seat</button>
      {player && (
        <>
          <div>player.username</div>
          <button onClick={() => onLeaveClick(seatNumber)}>Leave seat</button>
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