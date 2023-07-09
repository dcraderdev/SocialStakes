import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory} from 'react-router-dom';
import { useDispatch, useSelector  } from 'react-redux';
import * as sessionActions from '../../redux/middleware/users';
import { ModalContext } from '../../context/ModalContext';
import { WindowContext } from '../../context/WindowContext';
import { showGamesAction } from '../../redux/actions/gameActions';


import './ProfileButtonModal.css';

function ProfileButtonModal() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { modal, openModal, closeModal, needsRerender, setNeedsRerender } = useContext(ModalContext);
  const formRef = useRef(null);

  const user = useSelector(state => state.users.user);
  const balance = useSelector(state=> state.users.balance)

  const {profileBtnRef} = useContext(WindowContext);


  const logout = (e) => {
    dispatch(showGamesAction())
    dispatch(sessionActions.logout());
    history.push('/');
    closeModal();
  };


  const navModal = (type) => {
    closeModal();
    openModal(type)
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileBtnRef.current.contains(event.target)) {
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
  }, []);



  return (
    
    <>
      <ul className='profilemenu' ref={formRef}>
        {user ? (
          <div>
            <div className='profilemenu-user-welcome flex'>

              <div className='profilemenu-hello flex'>
                <div className='profilemenu-icon'>
                    <i className="fa-solid fa-user" />
                </div>
                {user.username}
                </div>
              <div className='profilemenu-balance'>$ {balance}</div>
            </div>


            <div className='profilemenu-option'>
            Friends
            </div>

            <div className='profilemenu-option'>
            Invites
            </div>

            <div className='profilemenu-option'>
            Stats
            </div>

          
            <div className='profilemenu-logout-container flex center'>

              <div className='profilemenu-logout-button flex center' onClick={logout}>
                Logout
              </div>
            </div>

          </div>

        ) : (
          <div>
            <div className='div-link' onClick={() => navModal('login')}>
              Sign In
            </div>
            <div className='div-link' onClick={() => navModal('signup')}>
              Sign Up
            </div>
          </div>
        )}
      </ul>
    </>
  );
}

export default ProfileButtonModal;