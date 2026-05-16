import React, { useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './WinnersTicker.css';

const DEMO_WINS = [
  { icon: '🎰', text: 'alex won $2,400 on Mid Stakes' },
  { icon: '💰', text: 'jordan won $1,100 on Hi Lo' },
  { icon: '🃏', text: 'sam hit blackjack ×3 in a row' },
  { icon: '🏆', text: 'riley won $3,200 on Hi Stakes' },
  { icon: '🎯', text: 'casey doubled down for $880' },
  { icon: '🎲', text: 'morgan went on a 6-win streak' },
  { icon: '💎', text: 'taylor won $1,750 in Acey Duecey' },
  { icon: '🔥', text: 'skyler is on a 4-table run' },
  { icon: '🎴', text: 'drew split aces and won both' },
  { icon: '💫', text: 'lane hit Hi Lo 8 times straight' },
];

const GAME_ICONS = {
  multi_blackjack: '🃏',
  single_blackjack: '🎴',
  poker: '♠️',
  acey_duecey: '🎲',
  coin_flip: '🪙',
  hi_lo: '🎯',
};

function buildItems(payoutMessages) {
  const bigWins = (payoutMessages || [])
    .filter((m) => m.payout > 0 && m.payout > m.bet)
    .slice(-14);

  if (bigWins.length < 3) return DEMO_WINS;

  return bigWins.map((m) => ({
    icon: GAME_ICONS[m.gameType] || '🎰',
    text: `${m.username} won $${Number(m.payout).toLocaleString()} on ${m.gameType?.replace(/_/g, ' ')}`,
  }));
}

function WinnersTicker() {
  const payoutMessages = useSelector((state) => state.chats.payoutMessages || []);
  const trackRef = useRef(null);

  const items = useMemo(() => buildItems(payoutMessages), [payoutMessages]);
  // Duplicate for seamless loop — CSS animation translates -50%
  const doubled = [...items, ...items];

  return (
    <div className="wticker-bar" aria-label="Big winners today" role="marquee">
      <span className="wticker-label" aria-hidden="true">
        Big winners
      </span>
      <div className="wticker-clip">
        <div className="wticker-track" ref={trackRef}>
          {doubled.map((item, i) => (
            <span key={i} className="wticker-item">
              <span className="wticker-icon">{item.icon}</span>
              {item.text}
              <span className="wticker-sep" aria-hidden="true">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WinnersTicker;
