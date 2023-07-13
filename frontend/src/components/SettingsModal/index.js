import React, { useEffect, useRef, useState, useContext } from 'react';
import * as sessionActions from '../../redux/middleware/users';
import * as gameActions from '../../redux/middleware/games';

import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';
import { changeTableThemeAction, changeNeonThemeAction } from '../../redux/actions/userActions';

import './SettingsModal.css'

const SettingsModal = () => {

  const { modal, openModal, closeModal, updateObj, setUpdateObj } = useContext(ModalContext);
  const { socket } = useContext(SocketContext);
  const dispatch = useDispatch();
  const history = useHistory()
  const formRef = useRef()


  const activeTable = useSelector(state=>state.games.activeTable)
  const currentTables = useSelector(state=>state.games.currentTables)
  const user = useSelector(state => state.users.user)
  const tableTheme = useSelector(state => state.users.tableTheme);
  const neonTheme = useSelector(state => state.users.neonTheme);


  const [tableName, setTableName] = useState('')
  const [isEditingTableName, setIsEditingTableName] = useState(false)
  const [tableCreator, setTableCreator] = useState(false)
  const [isInvitingFriends, setIsInvitingFriends] = useState(false)
  const [isHandInProgress, setIsHandInProgress] = useState(false);



  useEffect(() => {
    if(activeTable && currentTables && currentTables[activeTable.id]){
      let handInProgress = currentTables[activeTable.id]?.handInProgress;
      setIsHandInProgress(handInProgress)

      setTableName(currentTables[activeTable.id].tableName)
      setTableCreator(currentTables[activeTable.id].userId)
    }
  }, [currentTables, activeTable]);

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

  const handleTableThemeChange = (event) => {
    const tableTheme = event.target.value;
    console.log(tableTheme);
    dispatch(changeTableThemeAction(tableTheme));
  };

  const handleNeonThemeChange = (event) => {
    const neonTheme = event.target.value;
    console.log(neonTheme);
    dispatch(changeNeonThemeAction(neonTheme));
  };


  const editTableName = () => {
    setIsEditingTableName(true)
  };

  const saveTableName = () => {
    let tableObj = {
      tableId:activeTable.id,
      tableName,
      userId: user.id
    }
    setIsEditingTableName(false)
    dispatch(gameActions.editTableName(tableObj, socket))
  };


  const closeTable = () => {
    closeModal()
    openModal('closeTable')
    setUpdateObj({tableId:activeTable.id})
    setIsEditingTableName(true)
  };
  


  return (
    <div className='settingsmodal-wrapper' ref={formRef}>

      {!isInvitingFriends && (

      <div className='settingsmodal-container'>

      <div className='settingsmodal-table-name-container'>
        <div className='flex center'>        

        {!isEditingTableName && (

          <div className='table-name-header'>{tableName}</div>
          
        )}


    {isEditingTableName && (
      <div className='table-name-header'>
            <input 
            className='table-name-input'
              type="text"
              value={tableName}
              onChange={(e)=>setTableName(e.target.value)}
              autoFocus
            />

      </div>
    )}

      {user.id === tableCreator && (
<>
        {!isEditingTableName && (
          <div className='table-edit-button' onClick={editTableName}>

            <i className="fa-regular fa-pen-to-square"></i>
          </div>

        )}
        {isEditingTableName && (
            <div className='table-edit-button' onClick={saveTableName}>

          <i className="fa-solid fa-check"></i> 
          </div>
        )}
        {!isHandInProgress && (
            <div className='table-edit-button' onClick={closeTable}>

              <i className="fa-regular fa-trash-can"></i>
            </div>
        )}


</>
      )}






        </div>
      </div>


        <div className='flex tableid-container'>
          <div className='flex'>Table Id: </div>
          <div className='flex'>{activeTable?.id} </div>
        </div>


        <div className='settingsmodal-table-felt-container flex'>
        <div>Table Themes:</div>

          <div>
            <select 
            className='theme-button' 
            onChange={handleTableThemeChange}
            value={tableTheme} 
            >

              <option value="none">None</option>
              <option value="black">Black</option>
              <option value="darkgreen">Dark Green</option>
              <option value="lightgreen">Light Green</option>
              <option value="red">Red</option>
              <option value="realfelt">Real</option>
            </select>
          </div>
        </div>

        <div className='settingsmodal-table-neon-container flex'>
            <div>Neon Themes:</div>
            <div>
              <select 
              className='theme-button' 
              onChange={handleNeonThemeChange}
              value={neonTheme} 
              >
                <option value="none">None</option>
                <option value="neon-pink">Pink</option>
                <option value="neon-blue">Blue</option>
                <option value="neon-yellow">Yellow</option>
                <option value="neon-green">Green</option>
                <option value="neon-white">White</option>
              </select>
            </div>
        </div>


        <div className='settingsmodal-invite-container flex center'>
            <div className='invite-friends-button flex center' onClick={()=>setIsInvitingFriends(true)}>Invite Friends</div>
        </div>
        </div>
        
      )}




          {isInvitingFriends && (
      <div className='settingsmodal-container'>

            <div className='gamefloor-back-button-container'>
              <div className='gamefloor-back-button flex center' onClick={()=>setIsInvitingFriends(false)}>
                <i className="fa-solid fa-arrow-left-long"></i>
              </div>
            </div>

          <div className='settingsmodal-inviting-friends-container flex center'>
              Friends List Coming Soon
          </div>
      </div>


          )}


      
    </div>

    
  )
}
export default SettingsModal