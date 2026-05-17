import React from 'react';
import { useHistory } from 'react-router-dom';
import './GameBottomCTA.css';

const GAMES = [
  { label: 'Coin Flip',        path: '/play/coinflip',  icon: '🪙' },
  { label: 'Hi Lo',            path: '/play/hilo',      icon: '🃏' },
  { label: 'Acey Duecey',      path: '/play/acey',      icon: '🎴' },
  { label: "Hold 'em",         path: '/play/holdem',    icon: '♠️' },
  { label: 'Slots',            path: '/play/slots',     icon: '🎰' },
  { label: 'Roulette',         path: '/play/roulette',  icon: '🎡' },
];

function GameBottomCTA({ currentPath }) {
  const history = useHistory();
  const others = GAMES.filter(g => g.path !== currentPath);

  return (
    <div className="game-bottom-cta">
      <button className="game-bottom-back" onClick={() => history.push('/')}>
        <i className="fa-solid fa-arrow-left" /> All Games
      </button>

      <div className="game-bottom-others">
        <span className="game-bottom-label">Try another game:</span>
        <div className="game-bottom-list">
          {others.map(g => (
            <button
              key={g.path}
              className="game-bottom-pill"
              onClick={() => history.push(g.path)}
            >
              <span>{g.icon}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameBottomCTA;
