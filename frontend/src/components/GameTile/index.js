//GameTile
import React, { useState, useRef, useEffect } from 'react';
import { Route, Router, Switch, NavLink, useHistory } from 'react-router-dom';
import './GameTile.css';


const GameTile = ({game, handleClick}) => {

  return (
    <div>
      <div className='game-tile' onClick={() => handleClick(game)}>
        <p>{game}</p>
      </div>
    </div>
  );
};

export default GameTile;
