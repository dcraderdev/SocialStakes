import React, { useRef, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import './WinnerChatbox.css';
import MessageTile from '../MessageTile';

import { WindowContext } from '../../context/WindowContext';

const WinnerChatbox = () => {
  const winnerMessages = useSelector((state) => state.chats.winnerMessages || []);
  const bottomRef = useRef(null);
  const {windowWidth} = useContext(WindowContext)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [winnerMessages]);




    function convertToReadableFormatShort(timestamp) {
      const date = new Date(timestamp);

      const options = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      const readableFormat = date.toLocaleString('en-US', options);

      return readableFormat;
    }



  return (
    <div className="winnerchatbox-container flex">
        <div className={`winnerchatbox-item-container header flex`}>
              <div className={`winnerchatbox-item flex`}>Game</div>
              <div className={`winnerchatbox-item flex`}>User</div>
{ windowWidth > 1000 &&             <div className={`winnerchatbox-item flex`}>Time</div>}
              <div className={`winnerchatbox-item flex`}>Bet</div>
              <div className={`winnerchatbox-item flex`}>Payout</div>
        </div>


        <div className={`winnerchatbox-message-container`}>
          {winnerMessages.map((message, index) => (
            <div className={`winnerchatbox-item-container flex ${index % 2 === 0 ? ' darker' : ' lighter'}`}>
              <div className={`winnerchatbox-item flex`}>{message.gameType}</div>
              <div className={`winnerchatbox-item flex`}>{message.username}</div>
{ windowWidth > 1000 &&             <div className={`winnerchatbox-item flex`}>{convertToReadableFormatShort(message.createdAt)}</div>}
              <div className={`winnerchatbox-item flex`}>${message.bet}</div>
              <div className={`winnerchatbox-item flex`}>${message.payout}</div>

            </div>
          ))}
          <div className="winnerchatbox-bottom-ref" ref={bottomRef}></div>
        </div>
    </div>
  );
};
export default WinnerChatbox;
