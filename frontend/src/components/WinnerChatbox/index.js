import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './WinnerChatbox.css';
import MessageTile from '../MessageTile';

const WinnerChatbox = () => {
  const winnerMessages = useSelector((state) => state.chats.winnerMessages || []);
  const bottomRef = useRef(null);

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
    <div className="winnerchatbox-container">
        <div className={`winnerchatbox-message-container`}>
          {winnerMessages.map((message, index) => (
            <div className='flex'>
              <div>{message.gameType}</div>
              <div>{message.bet}</div>
              <div>{message.payout}</div>
              <div>{message.username}</div>
              <div>{convertToReadableFormatShort(message.createdAt)}</div>

            </div>
          ))}
          <div className="winnerchatbox-bottom-ref" ref={bottomRef}></div>
        </div>
    </div>
  );
};
export default WinnerChatbox;
