//GameTile
import React, { useState, useRef, useEffect } from 'react';
import { Route, Router, Switch, NavLink, useHistory } from 'react-router-dom';
import './GameTile.css';


const GameTile = ({game, checkTables}) => {

  console.log(game);
  console.log(game.gameType);



  return (
    <div>
      <div className='game-tile' onClick={() => checkTables(game.gameType)}>
        <p>{game.gameType}</p>
      </div>
    </div>
  ); 
};

export default GameTile;
