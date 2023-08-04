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
  const conversations = useSelector((state) => state.chats.conversations);
  const user = useSelector((state) => state.users.user);
  const [isActive, setIsActive ] = useState(false);
  const [tileText, setTileText ] = useState('');



  useEffect(()=> {
    setIsActive(false)
    if(currentConversationId === conversation?.conversationId){
      setIsActive(true)
    }

    setTileText(conversation?.chatName)

    if ( conversation && conversations) {
      let currentConvo = conversations[conversation.conversationId]
      let convoIsDM = currentConvo?.isDirectMessage
      let hasDefaultChatName = currentConvo?.hasDefaultChatName

      if(convoIsDM && hasDefaultChatName){
        let chatNameSplit = currentConvo?.chatName.split(',')
        let newChatName = chatNameSplit[0] === user?.username ? chatNameSplit[1] : chatNameSplit[0]
        setTileText(newChatName);
      } else {
        setTileText(conversation?.chatName)
      }
    }

  },[currentConversationId, conversation, conversations])


  // sub menu tile
  if (type === 'submenu') {
    return (
      <div
        onClick={() => dispatch(showConversationAction(conversation))}
        className={`conversationtile-submenu-wrapper flex`}
      >
        <div className={`conversationtile-container flex`}>
          <div className="flex align-center">
            <div className={`conversationtile-profile-image-container flex center ${isActive ? ' active-conversation' : ''}`}>
              <div className={`conversationtile-profile-image flex center`}>
                {`:)`}
              </div>
            </div>

            <div className={`conversationtile-name-container`}>
               <div className={`conversationtile-name ${isActive ? ' active-name' : ''}`}>
                {tileText}
              </div>
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
