import React, { useState, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../../context/SocketContext';

import { getUserFriends } from '../../redux/middleware/friends';

import FriendsNavBar from '../FriendsNavBar';

import './FriendsPage.css';

const FriendsPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.users.user);
  const friends = useSelector((state) => state.friends);
  const currentFriendView = useSelector(
    (state) => state.friends.currentFriendView
  );
  const showFriendInvites = useSelector(
    (state) => state.friends.showFriendInvites
  );
  const showFriends = useSelector((state) => state.friends.showFriends);
  const showTableInvites = useSelector(
    (state) => state.friends.showTableInvites
  );
  const currentTables = useSelector((state) => state.games.currentTables);
  const [hasCurrentTables, setHasCurrentTables] = useState(false);
  const [header, setHeader] = useState('');
  const [currentFriendViewTab, setCurrentFriendViewTab] = useState(null);

  const currentFriendViewConversations = 'currentFriendViewConversations'
  const currentFriendViewPastGames = 'currentFriendViewPastGames'
  const currentFriendViewStats = 'currentFriendViewStats'



  console.log(showFriendInvites);
  console.log(currentFriendView);

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
              {currentFriendView?.username || 'Friend'}
            </div>
          </div>
        </div>
      );
    }
  }, [showFriendInvites, showTableInvites, currentFriendView]);

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
            {Object.entries(friends.outgoingRequests).map(
              ([key, friend], index) => {
                return (
                  <div key={index} className="friendtile-wrapper">
                    {friend.friend.username}
                  </div>
                );
              }
            )}

            <div className="friendspage-header flex">Outgoing</div>
            {Object.entries(friends.incomingRequests).map(
              ([key, friend], index) => {
                return (
                  <div key={index} className="friendtile-wrapper">
                    {friend.friend.username}
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
