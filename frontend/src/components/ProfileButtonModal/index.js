import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as sessionActions from '../../redux/middleware/users';
import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';
import { WindowContext } from '../../context/WindowContext';
import {
  showGamesAction,
  showCreatingGameAction,
} from '../../redux/actions/gameActions';

import tableIcon from '../../images/table-icon.svg';

import './ProfileButtonModal.css';

function ProfileButtonModal() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { modal, openModal, closeModal, needsRerender, setNeedsRerender } =
    useContext(ModalContext);
  const { socket } = useContext(SocketContext);
  const formRef = useRef(null);

  const user = useSelector((state) => state.users.user);
  const balance = useSelector((state) => state.users.balance);
  const currentTables = useSelector((state) => state.games.currentTables);

  const { profileBtnRef } = useContext(WindowContext);

  const [showTables, setShowTables] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  const logout = (e) => {
    socket.emit('disconnect_user');
    dispatch(showGamesAction());
    dispatch(sessionActions.logout());
    history.push('/');
    closeModal();
  };

  const navModal = (type) => {
    closeModal();
    openModal(type);
  };

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if(modal !== 'profileModal') {
        return
      }
      if (
        profileBtnRef &&
        profileBtnRef.current &&
        profileBtnRef.current.contains(event.target)
      ) {
        return;
      }

      if (formRef.current && !formRef.current.contains(event.target)) {
        closeModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modal]);


  return (
    <>
      <div className={`profilemenu`} ref={formRef}>
        {user ? (
          <div>
            <div className="profilemenu-user-info flex">
              <div className="profilemenu-profileimage-wrapper flex center">
                <div className="profilemenu-profileimage-container flex center">
                  <i className="fa-regular fa-user"></i>
                </div>
              </div>

              <div className="profilemenu-namebalance-container">
                <div className="profilemenu-name-container flex">
                  {user.username}
                </div>
                <div className="profilemenu-balance-container flex">
                  <div className="profilemenu-balance-text flex">Balance:</div>
                  <div
                    className={`profilemenu-balance-balance flex ${
                      user && user.balance > 0 ? 'green' : 'red'
                    }`}
                  >
                    ${user.balance}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="profilemenu-cashier flex center"
              onClick={() => {
                history.push('/friends');
                closeModal();
              }}
            >
              <div className="profilemenu-cashier-button flex center">
                Cashier
              </div>
            </div>

            <div className="profilemenu-section first">

            <div
                onClick={() => {
                  closeModal()
                  history.push('/')
                  dispatch(showGamesAction())
                }}
                className={`profilemenu-option`}
              >
                <div className={`profilemenu-option-text`}>Home</div>
                <div className="profilemenu-option-icon">
                  <i className="fa-solid fa-home"></i>
                </div>
              </div>


              <div
                onClick={() => {
                  setShowTables(!showTables)
                }}
                className={`profilemenu-option ${showTables ? 'active-menutab' : ''}`}
              >
                <div className={`profilemenu-option-text`}>My Tables</div>
                <div className="profilemenu-option-icon">
                  <i className="fa-solid fa-star"></i>
                </div>
              </div>

              <div
                className={`show-tables ${showTables ? 'expand' : 'collapse'}`}
              >
                {currentTables &&
                  Object.values(currentTables).length > 0 &&
                  Object.values(currentTables).map((table, index) => {
                    return (
                      <div
                      onClick={() => {
                        closeModal()
                        history.push('/')
                        socket.emit('view_room', table.id);
                      }}
                       className="profilemenu-table-option flex" key={index}>
                        <div className="profilemenu-option-text">
                          {table.tableName}
                        </div>
                      </div>
                    );
                  })}

                {currentTables &&
                  Object.entries(currentTables).length === 0 && (
                      <div className="profilemenu-notables flex center">No tables!</div>
                  )}
              </div>

              <div
                className="profilemenu-option"
                onClick={() => {
                  closeModal();
                  history.push('/');
                  dispatch(showCreatingGameAction());
                }}
              >
                <div className="profilemenu-option-text">
                  Create Private Table
                </div>
                <div className="profilemenu-option-icon">
                  <i className="fa-solid fa-circle-plus"></i>
                </div>
              </div>

              <div
                className="profilemenu-option"
                onClick={() => {
                  closeModal();
                  openModal('joinPrivateGame');
                }}
              >
                <div className="profilemenu-option-text">
                  Join Private Table
                </div>
                <div className="profilemenu-option-icon">
                  <i className="fa-solid fa-unlock-keyhole"></i>
                </div>
              </div>
            </div>

            <div className="profilemenu-section">
              <div
                className="profilemenu-option"
                onClick={() => {
                  history.push('/friends');
                  closeModal();
                }}
              >
                <div className="profilemenu-option-text">Friends</div>
                <div className="profilemenu-option-icon">
                  <i className="fa-solid fa-user-group"></i>
                </div>
              </div>

              <div
                className="profilemenu-option"
                onClick={() => {
                  history.push('/friends');
                  closeModal();
                }}
              >
                <div className="profilemenu-option-text">Invites</div>
                <div className="profilemenu-option-icon">
                  <i className="fa-solid fa-envelopes-bulk"></i>
                </div>
              </div>
            </div>

            <div className="profilemenu-section">
              <div
                className="profilemenu-option"
                onClick={() => {
                  history.push('/stats');
                  closeModal();
                }}
              >
                <div className="profilemenu-option-text">Game History</div>
                <div className="profilemenu-option-icon">
                  <i className="fa-solid fa-clock"></i>
                </div>
              </div>
              <div
                className="profilemenu-option"
                onClick={() => {
                  history.push('/stats');
                  closeModal();
                }}
              >
                <div className="profilemenu-option-text">Stats</div>
                <div className="profilemenu-option-icon">
                  <i className="fa-solid fa-signal"></i>
                </div>
              </div>
            </div>

            <div className="profilemenu-section">
              <div className="profilemenu-option">
                <div className="profilemenu-option-text">Settings</div>
                <div className="profilemenu-option-icon">
                  {/* <img src={tableIcon} alt='table icon' ></img> */}
                  <i className="fa-solid fa-gear"></i>
                </div>
              </div>

              <div className="profilemenu-option">
                <div className="profilemenu-option-text">Themes</div>
                <div className="profilemenu-option-icon">
                  {/* <img src={tableIcon} alt='table icon' ></img> */}
                  <i className="fa-solid fa-brush"></i>
                </div>
              </div>
            </div>

            <div className="profilemenu-logout-container flex center">
              <div
                className="profilemenu-logout-button flex center"
                onClick={logout}
              >
                Logout
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div
              className="profilemenu-option"
              onClick={() => navModal('login')}
            >
              <div className="profilemenu-option-text">Sign In</div>
            </div>
            <div
              className="profilemenu-option"
              onClick={() => navModal('signup')}
            >
              <div className="profilemenu-option-text">Sign Up</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ProfileButtonModal;
