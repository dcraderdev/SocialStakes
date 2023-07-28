import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Table from '../Table';
import PlayerBetOptions from '../PlayerBetOptions';
import './Game.css'
import ActiveGameBar from '../ActiveGameBar';


const Game = () => {


  return (
    <div className='game-wrapper'>
      
      <div className='game-activegamebar-container'>
        <ActiveGameBar/>
      </div>
 
      <Table />
      <PlayerBetOptions /> 

    </div>
  )
}
export default Game