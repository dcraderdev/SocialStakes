import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import './FriendsNavBar.css';

import SearchBar from '../SearchBar';
import FriendTile from '../FriendTile';
import ConversationTile from '../ConversationTile';
import { ModalContext } from '../../context/ModalContext';

import {
  showFriendInvitesAction,
  showTableInvitesAction,
} from '../../redux/actions/friendActions';

const FriendsNavBar = () => {
  const viewFriends = 'view-friends';
  const viewConversations = 'view-conversations';
  const viewInvites = 'view-invites';

  const history = useHistory();
  const dispatch = useDispatch();
  const bottomRef = useRef(null);

  const {openModal} = useContext(ModalContext)


  const [currentFocus, setCurrentFocus] = useState(null);

  const friends = useSelector((state) => state.friends);
  const conversations = useSelector((state) => state.chats.conversations);

  const currentTables = useSelector((state) => state.games.currentTables);


  const isShowingFriendInvites = useSelector(
    (state) => state.friends.showFriendInvites
  );


  const isShowingTableInvites = useSelector(
    (state) => state.friends.showTableInvites
  );

  const showConversation = useSelector(
    (state) => state.friends.showConversation
  );

  const showFriends = useSelector(
    (state) => state.friends.showFriends
  );


  const [hasCurrentTables, setHasCurrentTables] = useState(false);

  //sets hieght for our sidemenu in case we have currentGames
  useEffect(() => {
    setHasCurrentTables(Object.entries(currentTables).length > 0);
  }, [currentTables]);



  //select which submenu is focused(opened)
  const toggleFocus = (focus) => {
    if (focus === currentFocus) {
      setCurrentFocus(null);
      return;
    }
    setCurrentFocus(focus);
  };



  useEffect(()=>{
    if(showConversation){
      setCurrentFocus(viewConversations);
    }

    if (showConversation && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }

  }, [isShowingFriendInvites,isShowingTableInvites,showConversation, showFriends])



  const getViewHeight = () => {
    if (currentFocus === viewFriends) {
      return hasCurrentTables ? 'friends-extra-extended' : 'friends-extended';
    }

    if (currentFocus === viewConversations) {
      return hasCurrentTables ? 'friends-extra-extended' : 'friends-extended';
    }

    if (currentFocus === viewInvites) {
      return hasCurrentTables ? 'invites-extra-extended' : 'invites-extended';
    }
  };

  const getContentHeight = () => {
    if (currentFocus === viewFriends) {
      return hasCurrentTables
        ? 'friendsnavbar-content-extended'
        : '';
    } else if (currentFocus === viewConversations) {
      return hasCurrentTables
        ? 'friendsnavbar-content-extended'
        : '';
    }

    if (currentFocus === viewInvites) {
      return hasCurrentTables ? 'invites-extra-extended' : ' invites-extended';
    }
  };



  return (
    <div className={`friendsnavbar-wrapper flex`}>
      <div className="friendsnavbar-container flex ">
        <div
          className={`friendsnavbar-searchbar-container flex center ${
            hasCurrentTables ? ' raised' : ''
          }`}
        >
          <SearchBar />
        </div>

        <div
          className={`friendsnavbar-option ${
            currentFocus === viewFriends ? getViewHeight() : ''
          }`}
        >
          <div
            onClick={() => toggleFocus(viewFriends)}
            className={`friendsnavbar-nav-header flex center ${
              currentFocus === viewFriends ? ' active-nav' : ''
            }`}
          >
            <div>Friends</div>
          </div>

          <div
            className={`friendsnavbar-content styled-scrollbar ${
              currentFocus === viewFriends ? getContentHeight() : ''
            }`}
          >
            {/* {friends && Object.entries(friends.friends).map(([key,friend],index) => { */}



            {friends &&
              Object.entries(friends.friends).map(([key, friend], index) => {
                return (
                  <FriendTile key={index} friend={friend} type={'submenu'} />
                );
              })}

            {!friends || Object.entries(friends.friends).length === 0 && (
              <div className='friendsnavbar-content-missing flex center'>No friends.</div>
            )}



          </div>
        </div>








        <div
          className={`friendsnavbar-option ${
            currentFocus === viewConversations ? getViewHeight() : ''
          }`}
        >
          <div
            onClick={() => toggleFocus(viewConversations)}
            className={`friendsnavbar-nav-header flex center ${
              currentFocus === viewConversations ? ' active-nav' : ''
            }`}
          >
            <div>Conversations</div>
            <div onClick={(e)=>{
              e.preventDefault()
              e.stopPropagation()
              openModal('newConversation')
            }} className='friendsnavbar-startconvo-button flex center'>
              <i className="fa-solid fa-plus"></i>
            </div>

          </div>
          <div
            className={`friendsnavbar-content styled-scrollbar ${
              currentFocus === viewConversations ? getContentHeight() : ''
            }`}
          >
            {conversations &&
              Object.entries(conversations).map(
                ([key, conversation], index) => {
                  if (!conversation.isTableChat) {
                    return (
                      <ConversationTile
                        key={index}
                        conversation={conversation}
                        type={'submenu'}
                      />
                    )
                  }
                }
              )}




{!conversations || Object.entries(conversations).length === 0 && (
              <div className='friendsnavbar-content-missing flex center'>No conversations.</div>
            )}

          <div ref={bottomRef} />


          </div>
        </div>

        <div
          className={`friendsnavbar-option invites ${
            currentFocus === viewInvites ? 'invites-extended' : ''
          }`}
        >
          <div
            onClick={() => toggleFocus(viewInvites)}
            className={`friendsnavbar-nav-header flex center  ${
              currentFocus === viewInvites ? ' active-nav' : ''
            }`}
          >
            <div>Invites</div>
          </div>
          <div
            className={`friendsnavbar-nav flex center ${
              isShowingTableInvites ? 'friendsnavbar-text-active' : ''
            }`}
            onClick={() => dispatch(showTableInvitesAction())}
          >
            Tables
          </div>
          <div
            className={`friendsnavbar-nav flex center ${
              isShowingFriendInvites ? 'friendsnavbar-text-active' : ''
            }`}
            onClick={() => dispatch(showFriendInvitesAction())}
          >
            Friends
          </div>
        </div>
      </div>
    </div>
  );
};
export default FriendsNavBar;
