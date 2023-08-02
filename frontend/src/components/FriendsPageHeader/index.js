import React, { useState, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../../context/SocketContext';

import { getUserFriends } from '../../redux/middleware/friends';
import { getUserConversations } from '../../redux/middleware/chat';

import FriendsNavBar from '../FriendsNavBar';
import FriendTile from '../FriendTile';
import ConversationTile from '../ConversationTile';
import { ModalContext } from '../../context/ModalContext';
import { WindowContext } from '../../context/WindowContext';
import './FriendsPageHeader.css';
import Chatbox from '../Chatbox';
import { showConversationAction } from '../../redux/actions/chatActions';
import ChatInputArea from '../ChatInputArea';

const FriendsPageHeader = () => {
  const currentFriendViewConversations = 'currentFriendViewConversations';
  const currentFriendViewPastGames = 'currentFriendViewPastGames';
  const currentFriendViewStats = 'currentFriendViewStats';

  const dispatch = useDispatch();
  const user = useSelector((state) => state.users.user);
  const friends = useSelector((state) => state.friends);
  const conversations = useSelector((state) => state.chats.conversations);
  const currentFriendView = useSelector(
    (state) => state.friends.currentFriendView
  );
  const currentConversationId = useSelector(
    (state) => state.chats.currentConversation
  );
  const showFriends = useSelector((state) => state.friends.showFriends);

  const showConversation = useSelector(
    (state) => state.friends.showConversation
  );
  const showTableInvites = useSelector(
    (state) => state.friends.showTableInvites
  );
  const showFriendInvites = useSelector(
    (state) => state.friends.showFriendInvites
  );

  const { openModal, setUpdateObj, updateObj } = useContext(ModalContext);
  const { socket } = useContext(SocketContext);
  const { windowWidth } = useContext(WindowContext);

  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showSubMenuButton, setShowSubMenuButton] = useState(false);
  const [isDirectMessage, setIsDirectMessage] = useState(false);

  const submenu = useRef();
  const submenuButton = useRef();

  const [header, setHeader] = useState('');
  const [headerText, setHeaderText] = useState('');
  const [isChangingChatName, setIsChangingChatName] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});

  const nameChangeInputRef = useRef()
  const nameChangeAcceptRef = useRef()
  const nameChangeCancelRef = useRef()


  useEffect(() => {
    setIsDirectMessage(false);

    if (showFriendInvites) {
      setHeader('Friend Invites');
      setShowSubMenuButton(false);
    }

    if (showTableInvites) {
      setHeader('Table Invites');
      setShowSubMenuButton(false);
    }

    if (showFriends && currentFriendView) {
      setShowSubMenuButton(true);
      setHeader(currentFriendView?.friend.username);
    }

    if (showConversation && conversations && currentConversationId) {
      let convoIsDM = conversations[currentConversationId].isDirectMessage;
      setIsDirectMessage(convoIsDM);
      setShowSubMenuButton(true);

      if (convoIsDM) {
        let chatNameSplit =
          conversations[currentConversationId].chatName.split(',');
        let newChatName =
          chatNameSplit[0] === user.username
            ? chatNameSplit[1]
            : chatNameSplit[0];
        setHeader(newChatName);
      } else {
        setHeader(conversations[currentConversationId].chatName);
      }
    }

    if (showFriends && !currentFriendView) {
      setHeader('Friend removed');
    }
  }, [
    showFriendInvites,
    showTableInvites,
    currentFriendView,
    showConversation,
    currentConversationId,
    currentFriendView,
  ]);

  // friendsTab friend menu modal logic handling
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (submenu.current && !submenu.current.contains(event.target)) {
        if (event.target === submenuButton.current) {
          return;
        }
        setShowSubMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleRemoveFriendModal = () => {
    setUpdateObj({ currentFriendView });
    openModal('RemoveFriendModal');
  };

  const startPrivateConversation = () => {
    let conversationObj = {
      friendshipId: currentFriendView.id,
      friend: currentFriendView.friend,
    };
    console.log('clik');
    socket.emit('start_private_conversation', conversationObj);
  };


  const handleChatNameChange = () => {

  }

  const cancelEdit = () => {

  }

  useEffect(() => {
    if (isChangingChatName) {

      let curerntChatName = header

      nameChangeInputRef.current.focus();


      const handleClickOutside = (event) => {
        if (nameChangeInputRef.current && !nameChangeInputRef.current.contains(event.target)) {
          if (nameChangeAcceptRef.current && nameChangeAcceptRef.current === event.target) {
            let changeObj = {
              newChatName: header,
              conversationId: 1
            }

            socket.emit('change_chatname', changeObj)
            isChangingChatName(false)
            return
          }
          if (nameChangeCancelRef.current && nameChangeCancelRef.current === event.target) {
            setHeader(curerntChatName)
            isChangingChatName(false)
            return
          }
          setShowSubMenu(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };






    }
  }, [isChangingChatName]);

  useEffect(() => {
    const errors = {};

    if (!header.length) errors['header'] = 'Please enter at least one character';


    setValidationErrors(errors);
  }, [headerText]);

  return (
    <div className="friendspage-friendview-header flex center">
      <div className={`friendspage-name-container`}>
        <div className={`friendspage-profile-image-container flex center`}>
          <div className={`friendspage-profile-image flex center`}>{`:)`}</div>
        </div>



        {isChangingChatName && (
          <div>
            <form onSubmit={handleChatNameChange} className={`friendspage-name flex center`}>


                <input
                  ref={nameChangeInputRef}
                  className="change-chatname"
                  type="text"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  required
                  placeholder={validationErrors['header'] || ''}
                />

                <button style={{display: 'none'}}></button>

        
                <div
                  ref={nameChangeAcceptRef}

                  className="change-chatname-option"
                  onClick={handleChatNameChange}
                >
                  <i className="fa-solid fa-check"></i>
                </div>

            <div
                  ref={nameChangeCancelRef}

            className="change-chatname-option"
            onClick={cancelEdit}
            >
              <i className="fa-solid fa-x"></i>
            </div>



            </form>
          </div>
        )}
        {!isChangingChatName && (
          <div className={`friendspage-name flex center`}>
            {header}
            {isDirectMessage && (
              <div className="friendspage-directmessage-text">
                {windowWidth > 700 ? `(Direct Message)` : 'DM'}
              </div>
            )}
          </div>
        )}






      </div>

      {showSubMenuButton && !isChangingChatName &&(
        <div className="friendspage-friendmenu-container">
          <div
            ref={submenuButton}
            className="friendspage-friendmenu-icon flex center"
            onClick={() => setShowSubMenu(!showSubMenu)}
          >
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </div>

          {/* SubMenu within convos tab */}
          {showSubMenu && showConversation && (
            <div ref={submenu} className="friendspage-submenu-container">
              {!isDirectMessage && (
                <div
                  onClick={() => {
                    setIsChangingChatName(true)
                  }}
                  className="friendspage-submenu-item message flex center"
                >
                  <div className="friendspage-item-text flex center">
                    Change group name
                  </div>
                  <div className="friendspage-item-icon flex center">
                    <i className="fa-solid fa-font"></i>
                  </div>
                </div>
              )}

              <div
                onClick={startPrivateConversation}
                className="friendspage-submenu-item message flex center"
              >
                <div className="friendspage-item-text flex center">
                  Change group image
                </div>
                <div className="friendspage-item-icon flex center">
                  <i className="fa-solid fa-camera"></i>
                </div>
              </div>

              {showSubMenu && !isDirectMessage && (
                <div
                  onClick={startPrivateConversation}
                  className="friendspage-submenu-item remove flex center"
                >
                  <div className="friendspage-item-text flex center">Leave</div>
                  <div className="friendspage-item-icon flex center">
                    <i className="fa-solid fa-right-to-bracket"></i>
                  </div>
                </div>
              )}

              {isDirectMessage && (
                <div
                  onClick={toggleRemoveFriendModal}
                  className="friendspage-submenu-item remove flex center"
                >
                  <div className="friendspage-item-text flex center">
                    Remove friend
                  </div>
                  <div className="friendspage-item-icon flex center">
                    <i className="fa-regular fa-trash-can"></i>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SubMenu within convos tab */}
          {showSubMenu && showFriends && (
            <div ref={submenu} className="friendspage-submenu-container">
              <div
                onClick={startPrivateConversation}
                className="friendspage-submenu-item message flex center"
              >
                <div className="friendspage-item-text flex center">
                  Change group image
                </div>
                <div className="friendspage-item-icon flex center">
                  <i className="fa-solid fa-camera"></i>
                </div>
              </div>

              <div
                onClick={toggleRemoveFriendModal}
                className="friendspage-submenu-item remove flex center"
              >
                <div className="friendspage-item-text flex center">
                  Remove friend
                </div>
                <div className="friendspage-item-icon flex center">
                  <i className="fa-regular fa-trash-can"></i>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default FriendsPageHeader;
