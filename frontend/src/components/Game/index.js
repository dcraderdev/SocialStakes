import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Table from '../Table';
import PlayerBetOptions from '../PlayerBetOptions';
import './Game.css'
import ActiveGameBar from '../ActiveGameBar';

import { WindowContext } from '../../context/WindowContext';


const Game = () => {

  const {windowWidth, windowHeight} = useContext(WindowContext)

  console.log(windowWidth);
  console.log(windowHeight);
  let isMobileView = windowHeight < 500




  return (
    <div className='game-wrapper'>
      
      <div className='game-activegamebar-container'>
        <ActiveGameBar/>
      </div>
 
      <Table />

      {!isMobileView && (
        <PlayerBetOptions /> 
      )}

      {!isMobileView && (
        <PlayerBetOptions /> 
      )}

    </div>
  )
}
export default Game