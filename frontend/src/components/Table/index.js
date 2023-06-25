import React, { useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, Link,useHistory, useParams} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Table.css'

import {changeNeonThemeAction, changeTableThemeAction} from '../../redux/actions/userActions';

import TableSeat from '../TableSeat';
import PlayerBetOptions from '../PlayerBetOptions';

const Table = () => {

  const dispatch = useDispatch()
  const themes = useSelector(state=>state.users.themes)
  const neonTheme = useSelector(state=>state.users.neonTheme)
  const tableTheme = useSelector(state=>state.users.tableTheme)
  const activeTable = useSelector(state=>state.games.activeTable)


  const initialSeats = Array(6).fill(null);
  const [seats, setSeats] = useState(initialSeats);



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


        <div className='seats-container'>
          <div className='top-seats flex between'>
            <TableSeat seatNumber={1} player={activeTable.tableUsers['1']} />
            <TableSeat seatNumber={6} player={activeTable.tableUsers['6']} />
          </div>
          <div className='mid-seats flex between'>
            <TableSeat seatNumber={2} player={activeTable.tableUsers['2']} />
            <TableSeat seatNumber={5} player={activeTable.tableUsers['5']} />
          </div>
          <div className='bot-seats flex between'>
            <TableSeat seatNumber={3} player={activeTable.tableUsers['3']} />
            <TableSeat seatNumber={4} player={activeTable.tableUsers['4']} />
          </div>
        </div>



    </div>
    </div>
  )
}
export default Table