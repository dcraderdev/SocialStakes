import React, { useState, useRef, useEffect } from 'react';
import { Route, Router, Switch, NavLink, useHistory, useParams } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux'

import * as gameActions from '../../redux/middleware/games';
import * as userActions from '../../redux/middleware/users';

import './TableTile.css'

const TableTile = ({table, viewTable}) => {

  const history = useHistory()
  const dispatch = useDispatch()

  const activeTable = useSelector(state=>state.games.activeTable)
  const currentTables = useSelector(state=>state.games.currentTables)
  const user = useSelector(state => state.users.user)



 
  const [status, setStatus] = useState(' open');
  const [isPrivate, setIsPrivate] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [decksUsed, setDecksUsed] = useState('');
  const [minBet, setMinBet] = useState(0);
  const [maxBet, setMaxBet] = useState(0);
  const [gameType, setGameType] = useState('Blackjack');

  useEffect(()=>{
    setStatus('Open')
    setPlayerCount(0);
    setMaxPlayers(0);
    setDecksUsed('');
    setMinBet(0);
    setMaxBet(0);

    if(table){
      setPlayerCount(table.players.length);
      setMaxPlayers(table.Game.maxNumPlayers);
      setDecksUsed(`${table.Game.decksUsed} Deck`);
      setMinBet(table.Game.minBet);
      setMaxBet(table.Game.maxBet);

      if(table.private){
        setIsPrivate(true)
      }
    }
  },[table])

  useEffect(()=>{

    if(playerCount<maxPlayers){
      setStatus(' open')
    }

    if(playerCount===maxPlayers){
      setStatus(' full')
    }

    if(isPrivate){
      setStatus(' private')
    }


  },[isPrivate, playerCount, maxPlayers, decksUsed, minBet, maxBet])




  return (
      <div className="tabletile-wrapper" onClick={()=>viewTable(table)}>
        <div className='tabletile-container'>
          <div className='tabletile-content flex center'>

<div className=' status-playercount-container flex center'>

            <div className='status-container flex center'>
              <div className='status-icon flex center'>
                <div className={`status-icon ${status}`}>
              </div>
            </div>
              
            </div>

            <div className='playercount-container flex center'>
              <div className='playercount-ring flex center'> 
                <div className='playercount-curr'>{playerCount}</div>
                <div className='playercount-curr'>/</div>
                <div className='playercount-max'>{maxPlayers}</div>
              </div>
            </div>

            <div className='game-deck-container flex'>
              <div className='game-text'>{gameType}</div>
              <div className='deck-text'>{decksUsed}</div>
            </div>

</div>

          
            <div className='betsize-container flex center'>
              <div>${minBet}</div>
              <div>/</div>
              <div className='betsize-maxbet'>${maxBet}</div>
            </div>
            


          
          

          </div>
        </div>
      </div>
  )
}
export default TableTile