import React, { useEffect, useRef, useState, useContext } from 'react';
import * as sessionActions from '../../redux/middleware/users';

import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import { ModalContext } from '../../context/ModalContext';
import { changeTableThemeAction, changeNeonThemeAction } from '../../redux/actions/userActions';

import './SettingsModal.css'

const SettingsModal = () => {

  const { modal, openModal, closeModal, updateObj, setUpdateObj } = useContext(ModalContext);
  const dispatch = useDispatch();
  const history = useHistory()
  const formRef = useRef()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        closeModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTableThemeChange = (tableTheme) => {
    console.log(tableTheme);
    dispatch(changeTableThemeAction(tableTheme));
  };

  const handleNeonThemeChange = (neonTheme) => {
    console.log(neonTheme);
    dispatch(changeNeonThemeAction(neonTheme));
  };


  return (
    <div className='settingsmodal-wrapper' ref={formRef}>
      <div className='settingsmodal-container'>

      <div className='settingsmodal-table-edit-container'>
        <div className='table-edit-header'>Change Table Name</div>
        <div className='table-edit-header'>Change Table Name</div>
      </div>



        <div className='settingsmodal-table-felt-container'>
          <div className='flex'>
            <div className='theme-button' onClick={()=>handleTableThemeChange('black')}>black</div>
            <div className='theme-button' onClick={()=>handleTableThemeChange('darkgreen')}>darkgreen</div>
            <div className='theme-button' onClick={()=>handleTableThemeChange('lightgreen')}>lightgreen</div>
            <div className='theme-button' onClick={()=>handleTableThemeChange('red')}>red</div>
            <div className='theme-button' onClick={()=>handleTableThemeChange('realfelt')}>realfelt</div>
          </div>
        </div>

        <div className='settingsmodal-table-neon-container'>
          <div className='flex'>
            <div className='theme-button' onClick={()=>handleNeonThemeChange('neon-pink')}>pink</div>
            <div className='theme-button' onClick={()=>handleNeonThemeChange('neon-blue')}>blue</div>
            <div className='theme-button' onClick={()=>handleNeonThemeChange('neon-yellow')}>yellow</div>
            <div className='theme-button' onClick={()=>handleNeonThemeChange('neon-green')}>green</div>
            <div className='theme-button' onClick={()=>handleNeonThemeChange('neon-white')}>white</div>
          </div>
        </div>
      
      </div>
    </div>

    
  )
}
export default SettingsModal