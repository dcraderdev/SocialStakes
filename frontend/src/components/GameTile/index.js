//GameTile
import React, { useState, useRef, useEffect } from 'react';
import { Route, Router, Switch, NavLink, useHistory } from 'react-router-dom';
import './GameTile.css';
import gameTileBackground from '../../images/game-tile-background.jpeg'


const GameTile = ({game, cbFunc}) => {


  const getIcon = (gameType) => {
    if(!gameType){
      return (
        <div className='gametile-container flex center'>
          <div>
            <div className=' flex center'></div>
          </div>
        </div>
      )
    }

    if(gameType === 'multi_blackjack'){
      return (
        <div className='gametile-container flex center'>
          <div>
            <div className=' flex center'>Multi Player</div>
            <div className=' flex center'>Blackjack</div> 
          </div>
        </div>
      )
    }
    if(gameType === 'single_blackjack'){
      return (
        <div className='gametile-container flex center'>
          <div>
            <div className=' flex center'>Single Player</div>
            <div className=' flex center'>Blackjack</div>
          </div>
        </div>
      )
    }
    if(gameType === 'poker'){
      return (
        <div className='gametile-container flex center'>
          <div>
            <div className=' flex center'>Texas</div>
            <div className=' flex center'>Hold 'em</div>
          </div>
        </div>
      )
    }
    if(gameType === 'acey_duecey'){
      return (
        <div className='gametile-container flex center'>
          <div>
            <div className=' flex center'>Acey</div>
            <div className=' flex center'>Duecey</div>
          </div>
        </div>
      )
    }
    if(gameType === 'coin_flip'){
      return (
        <div className='gametile-container flex center'>
            <div className=' flex center'>Coin Flip</div>
        </div>
      )
    }
    if(gameType === 'hi_lo'){
      return (
        <div className='gametile-container flex center'>
            <div className=' flex center'>Hi Lo</div>
        </div>
      )
    }
  };




  return (
    <div>
      <div className='game-tile pulse rounded' onClick={() => cbFunc(game.gameType)}>
        <div className='game-name'>{getIcon(game.gameType)}</div>
        
        <img src={gameTileBackground} alt='game tile'></img>
      </div>
    </div>
  ); 
};

export default GameTile;
