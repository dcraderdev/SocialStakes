import React, { useState, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../../context/SocketContext';

import { getUserFriends } from '../../redux/middleware/friends';

import FriendsNavBar from '../FriendsNavBar';
import FriendTile from '../FriendTile';
import { ModalContext } from '../../context/ModalContext';
import './FriendsPage.css';

const FriendsPage = () => {


  const currentFriendViewConversations = 'currentFriendViewConversations'
  const currentFriendViewPastGames = 'currentFriendViewPastGames'
  const currentFriendViewStats = 'currentFriendViewStats'
  const dispatch = useDispatch();
  const user = useSelector((state) => state.users.user);
  const friends = useSelector((state) => state.friends);
  const currentFriendView = useSelector(
    (state) => state.friends.currentFriendView
  );
  const showFriends = useSelector((state) => state.friends.showFriends);
  const showTableInvites = useSelector(
    (state) => state.friends.showTableInvites
  );
  const showFriendInvites = useSelector(
    (state) => state.friends.showFriendInvites
  );

  const { openModal, setUpdateObj, updateObj } = useContext(ModalContext);

  const currentTables = useSelector((state) => state.games.currentTables);
  const [hasCurrentTables, setHasCurrentTables] = useState(false);
  const [header, setHeader] = useState('');
  const [currentFriendViewTab, setCurrentFriendViewTab] = useState(currentFriendViewConversations);
  const [showFriendSubMenu, setShowFriendSubMenu] = useState(false);

  const submenu = useRef()
  const submenuButton = useRef()

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

  //sets hieght for our sidemenu in case we have currentGames
  useEffect(() => {
    setHasCurrentTables(Object.entries(currentTables).length > 0);
  }, [currentTables]);

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
                <div onClick={toggleRemoveFriendModal} className='friendpage-submenu-item remove flex center'>Remove <i className="fa-regular fa-trash-can"></i></div>
                <div className='friendpage-submenu-item message flex center'>Message <i className="fa-regular fa-message"></i></div>
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
  }, [showFriendInvites, showTableInvites, currentFriendView, showFriendSubMenu]);

  console.log(currentFriendView);



  useEffect(() => {
    if (!user) return;
    dispatch(getUserFriends(user.id));
  }, [user]);

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
          <div className="friendspage-friendview-container">
            
            <div className='friendspage-friendview-nav flex'>
              <div onClick={()=>setCurrentFriendViewTab(currentFriendViewConversations)} className={`friendview-nav ${currentFriendViewTab === currentFriendViewConversations ? 'nav-text-active' : ''}`}>
                <div className='nav-text'>Conversations</div>
                </div>
              <div onClick={()=>setCurrentFriendViewTab(currentFriendViewPastGames)} className={`friendview-nav ${currentFriendViewTab === currentFriendViewPastGames ? 'nav-text-active' : ''}`}>
                <div className='nav-text'>Past Games</div>
                </div>
              <div onClick={()=>setCurrentFriendViewTab(currentFriendViewStats)} className={`friendview-nav ${currentFriendViewTab === currentFriendViewStats ? 'nav-text-active' : ''}`}>
                <div className='nav-text'>Stats</div>
                </div>
            </div>


          </div>
        )}
      </div>
    </div>
  );
};
export default FriendsPage;
