import React, { useRef, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import './PayoutChatbox.css';
import MessageTile from '../MessageTile';

import { WindowContext } from '../../context/WindowContext';

const PayoutChatbox = () => {
  const payoutMessages = useSelector((state) => state.chats.payoutMessages || []);
  const bottomRef = useRef(null);
  const chatboxRef = useRef(null);
  const {windowWidth} = useContext(WindowContext)

  // useEffect(() => {
  //   if (bottomRef.current) {
  //     bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [payoutMessages]);

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
}, [payoutMessages]);


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


        <div className={`winnerchatbox-message-container`} ref={chatboxRef}>
          {payoutMessages.map((message, index) => (
            <div key={index} className={`winnerchatbox-item-container flex ${index % 2 === 0 ? ' darker' : ' lighter'}`}>
              <div className={`winnerchatbox-item flex`}>{message.gameType}</div>
              <div className={`winnerchatbox-item flex`}>
                
                
                <div className={`winnerchatbox-item-username flex`}>{message.username}</div>
                
              </div>
{ windowWidth > 1000 &&             <div className={`winnerchatbox-item flex`}>{convertToReadableFormatShort(message.createdAt)}</div>}
              <div className={`winnerchatbox-item flex`}>${message.bet}</div>
              <div className={`winnerchatbox-item flex`}>${message.payout}</div>

            </div>
          ))}
          {/* <div className="winnerchatbox-bottom-ref" ref={bottomRef}></div> */}
        </div>
    </div>
  );
};
export default PayoutChatbox;
