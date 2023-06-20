import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Table from '../Table';
import PlayerBetOptions from '../PlayerBetOptions';
import './Game.css'


const Game = ({ table, takeSeat, leaveSeat}) => {
  const seats = 6
  const game = 'blackjack'
  return (
    <div className='game-wrapper'>

 
      <Table seats={seats} takeSeat={takeSeat}/>
      {/* <PlayerBetOptions game={game}/>  */}
      <div className='gamefloor-leave-button' onClick={()=>leaveSeat(table)}>
        <i className="fa-solid fa-arrow-left-long"></i>
        <div>Leave</div>
      </div>


    </div>
  )
}
export default Game