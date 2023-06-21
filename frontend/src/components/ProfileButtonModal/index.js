import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory} from 'react-router-dom';
import { useDispatch, useSelector  } from 'react-redux';
import * as sessionActions from '../../redux/middleware/users';
import { ModalContext } from '../../context/ModalContext';
import { WindowContext } from '../../context/WindowContext';


import './ProfileButtonModal.css';

function ProfileButtonModal() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { modal, openModal, closeModal, needsRerender, setNeedsRerender } = useContext(ModalContext);
  const formRef = useRef(null);

  const user = useSelector(state => state.users.user);

  const {profileBtnRef} = useContext(WindowContext);


  const logout = (e) => {
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
      <ul className='profileMenu' ref={formRef}>
        {user ? (
          <div>
            <div className='profile-user-welcome'>
              <div className='profile-icon'> <i className="fa-solid fa-user" /></div>
              <div className='profile-hello'>Hello, {user.username}!</div>

            </div>


            <div className='profile-messages'>
            Friends
            </div>

            <div className='profile-messages'>
            Invites
            </div>

            <div className='profile-messages'>
            <div>Balance:</div><div>${user.balance}</div>
            </div>

            <button className='profile-menu-logout-button' onClick={logout}>
              Logout
            </button>

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