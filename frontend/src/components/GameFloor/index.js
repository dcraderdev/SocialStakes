import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';


import './GameFloor.css';

function GameFloor() {

  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.users.user);


  return ( 
    <>
      <div className='gamefloor-wrapper'>     
        <div className='gamefloor-container'>
          <div className='gamefloor-content'>GAME FLOOR</div>
          
        </div>
      </div>
    </>
  );

}

export default GameFloor;
