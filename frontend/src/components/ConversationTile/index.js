import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import './ConversationTile.css';
import { showFriendsAction } from '../../redux/actions/friendActions';
import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';
import { showConversationAction } from '../../redux/actions/chatActions';


const ConversationTile = ({ conversation, type }) => {
  const dispatch = useDispatch();
  const currentConversationId = useSelector((state) => state.chats.currentConversation);
  const [isActive, setIsActive ] = useState(false);


  useEffect(()=> {
    setIsActive(false)
    if(!currentConversationId || !conversation) return
    if(currentConversationId === conversation?.conversationId){
      setIsActive(true)
    }
  },[currentConversationId, conversation])

  // sub menu tile
  if (type === 'submenu') {
    return (
      <div
        onClick={() => dispatch(showConversationAction(conversation))}
        className={`conversationtile-submenu-wrapper flex`}
      >
        <div className={`conversationtile-container flex`}>
          <div className="flex">
            <div className={`conversationtile-profile-image-container flex center ${isActive ? ' active-conversation' : ''}`}>
              <div className={`conversationtile-profile-image flex center`}>
                {`:)`}
              </div>
            </div>

            <div className={`conversationtile-name-container flex center`}>
{conversation &&              <div className={`conversationtile-name flex center ${isActive ? ' active-name' : ''}`}>
                {conversation?.chatName || ''}
              </div>}
            </div>
          </div>

          <div className={`conversationtile-online-container flex center`}>
            <div className={`conversationtile-online flex center`}>
            </div>
          </div>
        </div>
      </div>
    );
  }

};
export default ConversationTile;
