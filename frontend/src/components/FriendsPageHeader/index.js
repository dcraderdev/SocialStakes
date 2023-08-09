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
  const [isChangingChatName, setIsChangingChatName] = useState(false);
  
  const [showValidationError, setShowValidationError] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [headerText, setHeaderText] = useState('');

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
      let convoIsDM = conversations?.[currentConversationId]?.isDirectMessage;
      setIsDirectMessage(convoIsDM);
      setShowSubMenuButton(true);

      if (convoIsDM) {
        let chatNameSplit =
          conversations?.[currentConversationId]?.chatName.split(',');
        let newChatName =
          chatNameSplit[0] === user?.username
            ? chatNameSplit[1]
            : chatNameSplit[0];
        setHeader(newChatName);
      } else {
        setHeader(conversations?.[currentConversationId]?.chatName);
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
    conversations
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

    if(showConversation && isDirectMessage){
      let friend = Object.values(conversations?.[currentConversationId].members).find(member => member.id !== user.id);
      let friendInfo = friends.friends[friend.id]
      friendInfo.conversationId = currentConversationId
      setUpdateObj({ friendInfo : friendInfo });
      openModal('RemoveFriendModal');

    }


    if(showFriends){
      setUpdateObj({ friendInfo : currentFriendView });
      openModal('RemoveFriendModal');
    }
  };

  const toggleLeaveConversationModal = () => {
    setUpdateObj({ currentConversationId });
    openModal('LeaveConversationModal');
  };

  const toggleAddFriendsModal = () => {
    setUpdateObj({ currentConversationId });
    openModal('AddFriendsModal');
  };

  const handleChatNameChange = (e) => {
    if(e) e.preventDefault()


    if(validationErrors['header']){
      return
    }

    if(validationErrors['length'] || validationErrors['trimmed-error']){
      if(!showValidationError){
        setShowValidationError(true)
        setTimeout(() => {
          setShowValidationError(false)
        }, 3000);
      }
      return
    }

    if(Object.values(validationErrors).length){
      return
    }


    setIsChangingChatName(false);

    let conversationId

    if (showFriends && currentFriendView) {
      conversationId = currentFriendView.currentConversationId;
    }

    if (showConversation && currentConversationId) {
      conversationId = currentConversationId;
    }
    if(!conversationId){
      return
    }

    let changeObj = {
      newChatName: header,
      conversationId,
    };
    socket.emit('change_chatname', changeObj);
    return
  }


  useEffect(() => {
    if (isChangingChatName) {
      let mouseDownTarget = null;
      let mouseUpTarget = null;

      nameChangeInputRef.current.focus();
  
      const handleMouseDown = (event) => {
        mouseDownTarget = event.target;
        nameChangeInputRef.current.focus();
    };
    
    const handleMouseUp = (event) => {
        mouseUpTarget = event.target;
        nameChangeInputRef.current.focus();
    
        let isCancelClick = nameChangeCancelRef.current && nameChangeCancelRef.current.contains(mouseUpTarget)
        let isAcceptClick = nameChangeAcceptRef.current && nameChangeAcceptRef.current.contains(mouseUpTarget)
        let isInputClick = nameChangeInputRef.current && nameChangeInputRef.current.contains(mouseUpTarget)
    
        let isSameClick = mouseUpTarget === mouseDownTarget
    
        if (mouseDownTarget !== event.target) {
          mouseDownTarget = null;
          return;
        }
    
        if (isSameClick && isAcceptClick) {
          handleChatNameChange()
          return;
        }
    
        if (isSameClick && isCancelClick) {
          setHeader(headerText);
          setIsChangingChatName(false);
          return;
        }
      
        if (!isCancelClick && !isAcceptClick && !isInputClick) {
          setHeader(headerText);
          setIsChangingChatName(false);
        }

    };
  
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isChangingChatName, validationErrors]);


  

  useEffect(() => {
    const errors = {};
    if(!header) return
    if (!header.length) errors['header'] = 'Please enter at least one character';
    if (!header.trim().length) errors['trimmed-error'] = 'Please enter at least one character';
    if (header.length > 30) errors['length'] = 'Must be 30 characters or less';
    setValidationErrors(errors);
  }, [header]);

  return (
    <div className="friendspage-friendview-header flex center">
      <div className={`friendspage-name-container`}>
        <div className={`friendspage-profile-image-container flex center`}>
          <div className={`friendspage-profile-image flex center`}>{`:)`}</div>
        </div>

        {isChangingChatName && (


          <div className='change-chatname-container'>


            {showValidationError && (

              <div className={`friendspage-name flex center validation-handling`}>

                {validationErrors['trimmed-error'] && validationErrors['trimmed-error']}
                {showValidationError && validationErrors['length'] && validationErrors['length']}
              </div>
            )}






            <form onSubmit={(e)=>handleChatNameChange(e)} className={`friendspage-name flex center`}>


                <input
                  ref={nameChangeInputRef}
                  className={`change-chatname`}
                  type="text"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  required
                  placeholder={validationErrors['header'] || ''}
                />

                <button style={{display: 'none'}}></button>

        <div onSubmit={(e)=>handleChatNameChange(e)}  className='change-chatname-options flex center'>

                <div
                  ref={nameChangeAcceptRef}

                  className="change-chatname-option"
                >
                  <i className="fa-solid fa-check"></i>
                </div>

            <div
                  ref={nameChangeCancelRef}

            className="change-chatname-option"
            >
              <i className="fa-solid fa-x"></i>
            </div>

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
                    setHeaderText(header);
                    setShowSubMenu(false);

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
                onClick={null}
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
                  onClick={toggleAddFriendsModal}
                  className="friendspage-submenu-item message flex center"
                >
                  <div className="friendspage-item-text flex center">
                    Add friends
                  </div>
                  <div className="friendspage-item-icon flex center">
                    <i className="fa-solid fa-user-plus"></i>
                  </div>
                </div>
              )}




              {showSubMenu && !isDirectMessage && (
                <div
                  onClick={toggleLeaveConversationModal}
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

          {/* SubMenu within friends tab */}
          {showSubMenu && showFriends && (
            <div ref={submenu} className="friendspage-submenu-container">
              <div
                onClick={null}
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
