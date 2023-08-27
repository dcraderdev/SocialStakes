import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';

import { getUserStats, getUserTables } from '../../redux/middleware/stats';

import './StatPage.css'
import ComingSoonImage from '../ComingSoonImage';

const StatPage = () => {

  const {socket} = useContext(SocketContext)
  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);

  const dispatch = useDispatch()

  const activeTable = useSelector(state=>state.games.activeTable)
  const currentTables = useSelector(state=>state.games.currentTables)
  const user = useSelector(state => state.users.user)
  const balance = useSelector(state => state.users.balance)
  const stats = useSelector(state => state.stats)
  const history = useSelector(state => state.stats.history)

  const [hasCurrentTables, setHasCurrentTables] = useState(false)

  console.log(stats);
  console.log(history);


  



  useEffect(() => {
    setHasCurrentTables(Object.entries(currentTables).length > 0);
  }, [currentTables]);


  useEffect(()=>{
    console.log('here');
    dispatch(getUserStats())
    dispatch(getUserTables())
  },[])

  if (!user) return;

  return (

    <div className={`statpage-container ${hasCurrentTables ? '' : 'extended'} flex`}>


      <div className='statpage-table-history-container'>




      </div>

            
    </div>
    
  )
}
export default StatPage



// date range
// game type

// first view is view of sesssions. started when player creates a userTable, ends when they leave seat and userTable active goes to false

// second view is hand history of all hands played at that userTable/table depending on game type
// show all cards in play for each hand that has played, show each action and what applicable info along with it (ie a blackjack hit, show the card that was taken) 