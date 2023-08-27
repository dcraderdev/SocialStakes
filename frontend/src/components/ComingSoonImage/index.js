import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';

import { getUserStats } from '../../redux/middleware/users';

import socialstakesCards2 from '../../images/socialstakes-logo-cards2.svg'
import './ComingSoonImage.css'

const ComingSoonImage = () => {

  const {socket} = useContext(SocketContext)
  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);

  const dispatch = useDispatch()

  const activeTable = useSelector(state=>state.games.activeTable)
  const currentTables = useSelector(state=>state.games.currentTables)
  const user = useSelector(state => state.users.user)
  const balance = useSelector(state => state.users.balance)


  useEffect(()=>{
    dispatch(getUserStats())
  },[])

  if (!user) return;

  return (
    <div className='comingsoon-container flex'>


      <div className='comingsoon-image-wrapper flex center'>

      <div className='comingsoon-image-container flex center'>
        <img src={socialstakesCards2} alt="cards"></img>
      </div>

        <div className='comingsoon-name flex center'>SOCIAL STAKES</div> 
      <div className='comingsoon-banner flex center'>Stats coming soon</div>
      </div>
            
      
    </div>
    
  )
}
export default ComingSoonImage