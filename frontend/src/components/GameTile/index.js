//GameTile
import React, { useState, useRef, useEffect } from 'react';
import { Route, Router, Switch, NavLink, useHistory } from 'react-router-dom';

import './GameTile.css';
import { Link } from 'react-router-dom';

const GameTile = ({game, setGameTables}) => {

  const [tileClass, setTileClass] = useState('game-tile')

  const history = useHistory()

  const navTo = (e) => {
    e.stopPropagation();
    history.push(`/games/${game.id}`)

  }

  const setTables = (e) => {
    // history.push(`/games/${game.id}`)
    setGameTables(game.id)
  }

  useEffect(()=>{
    setTileClass('game-tile')

    if(game ==='joinprivate' || game ==='startprivate' ){
      setTileClass('game-tile small')
    }
  },[game])



  return (
    <div>
        <div className={tileClass} onClick={()=>setTables(game.id)}>
          <p>{game.gameType}</p>
        </div>
    </div>
  );
};

export default GameTile;
