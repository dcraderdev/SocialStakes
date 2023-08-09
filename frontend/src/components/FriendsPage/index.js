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
import FriendsPageHeader from '../FriendsPageHeader';

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


  //sets hieght for our sidemenu in case we have currentGames
  useEffect(() => {
    setHasCurrentTables(Object.entries(currentTables).length > 0);
  }, [currentTables]);


  const getViewHeight = () => {
    if(showFriends){
     return hasCurrentTables ? 'friendspage-chatbox-extended lowered' : 'friendspage-chatbox-condensed lowered'
    }

    if(showConversation){
     return hasCurrentTables ? 'friendspage-chatbox-extended conversations' : 'friendspage-chatbox-condensed conversations'
    }


  }


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
        <div className="friendspage-header flex center">
          


    
          <FriendsPageHeader />

          

        </div>


        {showFriendInvites && (
          <div>
            <div className="friendspage-invite-header top flex">
              <div  className="friendspage-invite-text flex center">Incoming</div>
            </div>

            <div className='friendspage-requests-container'>
              {Object.entries(friends.incomingRequests).map(
                ([key, friend], index) => {
                  return (
                    <div key={index} className="friendtile-wrapper">
                      <FriendTile friend={friend} type={'invite-incoming'}/>
                    </div>
                  );
                }
              )}
            </div>

            <div className="friendspage-invite-header flex">
              <div  className="friendspage-invite-text flex center">Outgoing</div>
              
            </div>
            {Object.entries(friends.outgoingRequests).map(
              ([key, friend], index) => {
                return (
                  <div key={index} className="friendtile-wrapper">
                    <FriendTile friend={friend} type={'invite-outgoing'}/>
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
