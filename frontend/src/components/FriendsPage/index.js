import React, { useState, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../../context/SocketContext';

import { getUserFriends } from '../../redux/middleware/friends';
import { getUserConversations } from '../../redux/middleware/chat';

import FriendsNavBar from '../FriendsNavBar';
import FriendTile from '../FriendTile';
import ConversationTile from '../ConversationTile';
import { ModalContext } from '../../context/ModalContext';
import './FriendsPage.css';
import Chatbox from '../Chatbox';
import { showConversationAction } from '../../redux/actions/chatActions';
import ChatInputArea from '../ChatInputArea';

const FriendsPage = () => {


  const currentFriendViewConversations = 'currentFriendViewConversations'
  const currentFriendViewPastGames = 'currentFriendViewPastGames'
  const currentFriendViewStats = 'currentFriendViewStats'

  const dispatch = useDispatch();
  const user = useSelector((state) => state.users.user);
  const friends = useSelector((state) => state.friends);
  const conversations = useSelector((state) => state.chats.conversations);
  const currentFriendView = useSelector((state) => state.friends.currentFriendView);
  const currentConversationId = useSelector((state) => state.chats.currentConversation);
  const showFriends = useSelector((state) => state.friends.showFriends);


  const showConversation = useSelector((state) => state.friends.showConversation);
  const showTableInvites = useSelector((state) => state.friends.showTableInvites);
  const showFriendInvites = useSelector((state) => state.friends.showFriendInvites);

  const { openModal, setUpdateObj, updateObj } = useContext(ModalContext);
  const { socket } = useContext(SocketContext);

  const currentTables = useSelector((state) => state.games.currentTables);
  const [hasCurrentTables, setHasCurrentTables] = useState(false);
  const [header, setHeader] = useState('');
  const [currentFriendViewTab, setCurrentFriendViewTab] = useState(currentFriendViewConversations);
  const [showFriendSubMenu, setShowFriendSubMenu] = useState(false);

  const submenu = useRef()
  const submenuButton = useRef()



  // friendsTab friend menu modal logic handling
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (submenu.current && !submenu.current.contains(event.target)) {
        if(event.target === submenuButton.current){
          return
        }
        setShowFriendSubMenu(false)
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);




  const toggleSubMenu = () => {
      setShowFriendSubMenu(!showFriendSubMenu)
  }

  const toggleRemoveFriendModal = () => {
    setUpdateObj({currentFriendView})
   openModal('RemoveFriendModal')
  }

  const startPrivateConversation = () => {
    let conversationObj = {
      friendshipId: currentFriendView.id,
      friend: currentFriendView.friend
    }
    console.log('clik');
    socket.emit('start_private_conversation', conversationObj)

  }

  //sets hieght for our sidemenu in case we have currentGames
  useEffect(() => {
    setHasCurrentTables(Object.entries(currentTables).length > 0);
  }, [currentTables]);




  // Get header styling/content
  useEffect(() => {
    if (showFriendInvites) {
      setHeader('Friend Invites');
    }
    if (showTableInvites) {
      setHeader('Table Invites');
    }
    if (showFriends && currentFriendView) {
      setHeader(
        <div className="friendspage-friendview-header flex center">
          <div className={`friendspage-profile-image-container flex center`}>
            <div className={`friendspage-profile-image flex center`}>{`:)`}</div>
          </div>

          <div className={`friendspage-name-container flex center`}>
            <div className={`friendspage-name flex center`}>
              {currentFriendView?.friend.username}
            </div>

            <div className='friendpage-friendmenu-container' >
              <div ref={submenuButton} className='friendpage-friendmenu-icon flex center' onClick={toggleSubMenu}>
                <i className="fa-solid fa-ellipsis-vertical"></i>
              </div>

{showFriendSubMenu &&              <div ref={submenu} className='friendpage-submenu-container'>
                <div onClick={startPrivateConversation} className='friendpage-submenu-item message flex center'>Message <i className="fa-regular fa-message"></i></div>
                <div onClick={toggleRemoveFriendModal} className='friendpage-submenu-item remove flex center'>Remove <i className="fa-regular fa-trash-can"></i></div>
              </div>}

            </div>
          </div>
        </div>
      );
    }



    if (showConversation && conversations && currentConversationId) {
      setHeader(
        <div className="friendspage-friendview-header flex center">
          <div className={`friendspage-profile-image-container flex center`}>
            <div className={`friendspage-profile-image flex center`}>{`:)`}</div>
          </div>

          <div className={`friendspage-name-container flex center`}>
            <div className={`friendspage-name flex center`}>
              {conversations[currentConversationId].chatName}
            </div>
            <div className='friendpage-friendmenu-container' >
              <div ref={submenuButton} className='friendpage-friendmenu-icon flex center' onClick={toggleSubMenu}>
                <i className="fa-solid fa-ellipsis-vertical"></i>
              </div>

{showFriendSubMenu &&      
              <div onClick={startPrivateConversation} ref={submenu} className='friendpage-submenu-container'>

                <div className='friendpage-submenu-item red flex center'>
                  <div className='friendpage-item-text flex center'>Leave</div>
                  <div className='friendpage-item-icon flex center'>
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  </div>
                </div>

                <div className='friendpage-submenu-item flex center'>
                  <div className='friendpage-item-text flex center'>Change Name</div>
                  <div className='friendpage-item-icon flex center'>
                    <i className="fa-solid fa-font"></i>
                  </div>

                </div>



              </div>}

          </div>

          </div>
          
        </div>
      );
    }




    if (showFriends && !currentFriendView) {
      setHeader(
        <div className="friendspage-friendview-header flex center">
          <div className={`friendspage-profile-image-container flex center`}>
            <div className={`friendspage-profile-image flex center`}>{`:(`}</div>
          </div>

          <div className={`friendspage-name-container flex center`}>
            <div className={`friendspage-name flex center`}>
              Friend removed
            </div>

          </div>
        </div>
      );
    }
  }, [showFriendInvites, showTableInvites, currentFriendView, showFriendSubMenu, showConversation, currentConversationId]);


  
  const getViewHeight = () => {
    if(showFriends){
     return hasCurrentTables ? 'friendspage-chatbox-extended lowered' : 'friendspage-chatbox-condensed lowered'
    }

    if(showConversation){
     return hasCurrentTables ? 'friendspage-chatbox-extended conversations' : 'friendspage-chatbox-condensed conversations'
    }


  }




console.log(showConversation);




  if (!user) return;

  return (
    <div className="friendspage-wrapper flex">
      <div
        className={`friendspage-friendsnavbar-wrapper  ${
          hasCurrentTables ? ' expanded' : ' shrunk'
        }`}
      >
        <FriendsNavBar />
      </div>

      <div
        className={`friendspage-content-wrapper flex  ${
          hasCurrentTables ? ' expanded' : ' shrunk'
        }`}
      >
        <div className="friendspage-header flex center">{header}</div>

        <div className="friendspage-content"></div>

        {showFriendInvites && (
          <div>
            <div className="friendspage-header flex">Incoming</div>
            {Object.entries(friends.incomingRequests).map(
              ([key, friend], index) => {
                return (
                  <div key={index} className="friendtile-wrapper">
                    <FriendTile friend={friend} type={'invite'}/>
                  </div>
                );
              }
            )}

            <div className="friendspage-header flex">Outgoing</div>
            {Object.entries(friends.outgoingRequests).map(
              ([key, friend], index) => {
                return (
                  <div key={index} className="friendtile-wrapper">
                    {friend?.friend?.username || ''}
                    <FriendTile friend={friend} type={'submenu'}/>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* // currentFriendView */}
        {showFriends && (
          <div className="friendspage-friendview-container flex">
            
            <div className='friendspage-friendview-nav flex'>
              <div onClick={()=>setCurrentFriendViewTab(currentFriendViewConversations)} className={`friendview-nav ${currentFriendViewTab === currentFriendViewConversations ? 'nav-text-active' : ''}`}>
                <div className='nav-text'>Direct Messages</div>
                </div>
              <div onClick={()=>setCurrentFriendViewTab(currentFriendViewPastGames)} className={`friendview-nav ${currentFriendViewTab === currentFriendViewPastGames ? 'nav-text-active' : ''}`}>
                <div className='nav-text'>Past Games</div>
                </div>
              <div onClick={()=>setCurrentFriendViewTab(currentFriendViewStats)} className={`friendview-nav ${currentFriendViewTab === currentFriendViewStats ? 'nav-text-active' : ''}`}>
                <div className='nav-text'>Stats</div>
                </div>
            </div>


            {currentFriendViewTab === currentFriendViewConversations && currentFriendView && (
              <div className={`friendspage-chatbox-container ${getViewHeight()}`}>
                <Chatbox conversation={conversations[currentFriendView.conversationId]}/>
              </div>
            )}

            {currentFriendViewTab === currentFriendViewConversations && currentFriendView && (
              <div className="chatbox-chatinput-container">
                <ChatInputArea />
              </div>
            )}


          </div>
        )}

        {/* // currentConversationView */}
        {showConversation && (
          <div className={`friendspage-chatbox-container ${getViewHeight()}`} >
      
            <Chatbox conversation={conversations[currentConversationId]}/>
          </div>
        )}

        {showConversation && (
          <div className="chatbox-chatinput-container">
            <ChatInputArea />
          </div>
        )}




      </div>
    </div>
  );
};
export default FriendsPage;
