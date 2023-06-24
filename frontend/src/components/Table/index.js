import React, { useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, Link,useHistory, useParams} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Table.css'

import {changeNeonThemeAction, changeTableThemeAction} from '../../redux/actions/userActions';

import TableSeat from '../TableSeat';
import PlayerBetOptions from '../PlayerBetOptions';

const Table = () => {

  const dispatch = useDispatch()
  const game = 'blackjack'
  const themes = useSelector(state=>state.users.themes)
  const neonTheme = useSelector(state=>state.users.neonTheme)
  const tableTheme = useSelector(state=>state.users.tableTheme)
  const activeTable = useSelector(state=>state.games.activeTable)


  const initialSeats = Array(6).fill(null);
  const [seats, setSeats] = useState(initialSeats);


  // useEffect(() => {
  //   if(activeTable &&  activeTable.tableUsers){
  //   let newSeats = [...initialSeats];
  //   activeTable.tableUsers.forEach(user => {
  //       if(user.seat && user.seat <= 6 && user.seat > 0) {
  //         newSeats[user.seat - 1] = user;
  //       } 
  //     });
  //     setSeats(newSeats);
  //   }

  //   return () => {
  //     setSeats(initialSeats);
  //   };
  // }, [activeTable]);

  useEffect(() => {
    if(activeTable && activeTable.tableUsers){

      setSeats(activeTable.tableUsers);
    }

    return () => {
      setSeats(initialSeats);
    };
  }, [activeTable]);



  return (
    <div className='table-wrapper'>
    <div className='table-container '>
      <div className='table-content flex center'>
        {themes[tableTheme] && <img src={themes[tableTheme].url} alt='table'></img>}
      </div>



        {/* <div className='seats-container'>
          <div className='top-seats flex between'>
            <TableSeat seatNumber={1} player={seats[0]}/>
            <TableSeat seatNumber={6} player={seats[5]}/>
          </div>
          <div className='mid-seats flex between'>
            <TableSeat seatNumber={2} player={seats[1]}/>
            <TableSeat seatNumber={5} player={seats[4]}/>
          </div>
          <div className='bot-seats flex between'>
            <TableSeat seatNumber={3} player={seats[2]}/>
            <TableSeat seatNumber={4} player={seats[3]}/>
          </div>
        </div> */}
        <div className='seats-container'>
          <div className='top-seats flex between'>
            {seats[0] ? (
              <TableSeat seatNumber={1} player={seats[0]} />
            ) : (
              <TableSeat seatNumber={1} player={null} />
            )}
            {seats[5] ? (
              <TableSeat seatNumber={6} player={seats[5]} />
            ) : (
              <TableSeat seatNumber={6} player={null} />
            )}
          </div>
          <div className='mid-seats flex between'>
            {seats[1] ? (
              <TableSeat seatNumber={2} player={seats[1]} />
            ) : (
              <TableSeat seatNumber={2} player={null} />
            )}
            {seats[4] ? (
              <TableSeat seatNumber={5} player={seats[4]} />
            ) : (
              <TableSeat seatNumber={5} player={null} />
            )}
          </div>
          <div className='bot-seats flex between'>
            {seats[2] ? (
              <TableSeat seatNumber={3} player={seats[2]} />
            ) : (
              <TableSeat seatNumber={3} player={null} />
            )}
            {seats[3] ? (
              <TableSeat seatNumber={4} player={seats[3]} />
            ) : (
              <TableSeat seatNumber={4} player={null} />
            )}
          </div>
        </div>



    </div>
    </div>
  )
}
export default Table