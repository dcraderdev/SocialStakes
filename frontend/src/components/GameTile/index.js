//GameTile
import React, { useState, useRef, useEffect } from 'react';
import { Route, Router, Switch, NavLink, useHistory } from 'react-router-dom';
import './GameTile.css';


const GameTile = ({game, checkTables}) => {
  return (
    <div>
      <div className='game-tile pulse rounded' onClick={() => checkTables(game.gameType)}>
        <p>{game.gameType}</p>
      </div>
    </div>
  ); 
};

export default GameTile;
