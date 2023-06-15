import React, { useEffect, useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import ProfileButtonModal from '../ProfileButtonModal';
import { ModalContext } from '../../context/ModalContext';


import './Navigation.css';

function ProfileButton({ user }) {
  const { modal, openModal, closeModal } = useContext(ModalContext);

  const buttonClass = `nav-profile-button nav-button${modal === 'profileMenu' ? ' profile-button-active' : ''}`;

  return (
    <div>
      <button
        className={buttonClass}
        onClick={() => {openModal('profileMenu')}}
      >
        <div className='profile-button-icons'>
          <i className="fa-solid fa-bars" />
          <i className="fa-solid fa-user" />
        </div>
      </button>
    </div>
  );
}
 
export default ProfileButton;
