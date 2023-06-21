import React, { useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, Link,useHistory, useParams} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Table.css'

import {changeNeonThemeAction, changeTableThemeAction} from '../../redux/actions/userActions';

import TableSeat from '../TableSeat';
import PlayerBetOptions from '../PlayerBetOptions';

const Table = ({table, leaveTable}) => {

  const dispatch = useDispatch()
  const game = 'blackjack'
  const themes = useSelector(state=>state.users.themes)
  const neonTheme = useSelector(state=>state.users.neonTheme)
  const tableTheme = useSelector(state=>state.users.tableTheme)


  const initialSeats = Array(6).fill(null);
  const [seats, setSeats] = useState(initialSeats);
  const seatOrder = [0, 5, 1, 4, 2, 3];

// console.log(themes);
// console.log(tableTheme);
// console.log(themes[tableTheme]);

  useEffect(() => {
    if(table &&  table.tableUsers){
    let newSeats = [...initialSeats];
      table.tableUsers.forEach(user => {
        if(user.seat && user.seat <= 6 && user.seat > 0) {
          newSeats[user.seat - 1] = user;
        } 
      });
      setSeats(newSeats);
    }

    return () => {
      setSeats(initialSeats);
    };
  }, [table]);

  const handleTableThemeChange = (tableTheme) =>{
    console.log(tableTheme);
    dispatch(changeTableThemeAction(tableTheme))
  }



  return (
    <div className='table-wrapper'>
    <div className='table-container '>
      <div className='table-content flex center'>
        {/* <img src={feltGreen4} alt='table'></img> */}
        {themes[tableTheme] && <img src={themes[tableTheme].url} alt='table'></img>}
      </div>



        <div className='seats-container'>
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
        </div>

    <div className='flex'>
      <div className='theme-button' onClick={()=>handleTableThemeChange('black')}>black</div>
      <div className='theme-button' onClick={()=>handleTableThemeChange('darkgreen')}>darkgreen</div>
      <div className='theme-button' onClick={()=>handleTableThemeChange('lightgreen')}>lightgreen</div>
      <div className='theme-button' onClick={()=>handleTableThemeChange('red')}>red</div>
      <div className='theme-button' onClick={()=>handleTableThemeChange('realfelt')}>realfelt</div>
    </div>

    </div>
    </div>
  )
}
export default Table