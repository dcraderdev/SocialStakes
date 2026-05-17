import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import './WinnersTicker.css';

const DEMO_WINS = [
  { icon: '🎰', text: 'alex won $2,400 at Mid Stakes' },
  { icon: '💰', text: 'jordan won $1,100 on Hi Lo' },
  { icon: '🃏', text: 'sam hit blackjack ×3 in a row' },
  { icon: '🏆', text: 'riley won $3,200 at Hi Stakes' },
  { icon: '🎯', text: 'casey doubled down for $880' },
  { icon: '🎲', text: 'morgan went on a 6-win streak' },
  { icon: '💎', text: 'taylor won $1,750 in Acey Duecey' },
  { icon: '🔥', text: 'skyler cleared the board 4 times' },
  { icon: '🎴', text: 'drew split aces and won both hands' },
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

function buildItems(msgs) {
  const wins = (msgs || []).filter((m) => m.payout > 0 && m.payout > m.bet).slice(-14);
  if (wins.length < 3) return DEMO_WINS;
  return wins.map((m) => ({
    icon: GAME_ICONS[m.gameType] || '🎰',
    text: `${m.username} won $${Number(m.payout).toLocaleString()} on ${
      m.gameType?.replace(/_/g, ' ') ?? 'table'
    }`,
  }));
}

export default function WinnersTicker() {
  const payoutMessages = useSelector((state) => state.chats.payoutMessages || []);
  const items = useMemo(() => buildItems(payoutMessages), [payoutMessages]);
  // Duplicate for a seamless CSS loop — the animation translates -50%
  const doubled = [...items, ...items];

  return (
    <div className="wticker-bar" aria-label="Big winners today">
      <span className="wticker-label" aria-hidden="true">Big winners</span>
      <div className="wticker-clip" aria-hidden="true">
        <div className="wticker-track">
          {doubled.map((item, i) => (
            <span key={i} className="wticker-item">
              <span className="wticker-icon">{item.icon}</span>
              {item.text}
              <span className="wticker-sep">·</span>
            </span>
          ))}
        </div>
      </div>
      {/* Screen-reader-only static version */}
      <ul className="wticker-sr-list" aria-label="Recent big wins">
        {items.map((item, i) => (
          <li key={i}>{item.text}</li>
        ))}
      </ul>
    </div>
  );
}
