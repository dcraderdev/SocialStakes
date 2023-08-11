import React, { useEffect, useRef, useState, useContext } from 'react';
import * as sessionActions from '../../redux/middleware/users';
import * as gameActions from '../../redux/middleware/games';

import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';
import { changeTableThemeAction, changeNeonThemeAction } from '../../redux/actions/userActions';

import './ThemesModal.css'

const ThemesModal = () => {

  const { modal, openModal, closeModal, updateObj, setUpdateObj } = useContext(ModalContext);
  const { socket } = useContext(SocketContext);
  const dispatch = useDispatch();
  const history = useHistory()
  const formRef = useRef()


  const activeTable = useSelector(state=>state.games.activeTable)
  const currentTables = useSelector(state=>state.games.currentTables)
  const user = useSelector(state => state.users.user)

  const tableTheme = useSelector(state => state.users.tableTheme || 'None');
  const neonTheme = useSelector(state => state.users.neonTheme || 'None');
  const themes = useSelector(state => state.users.themes || '');

  
    const neonList = {  
      'None': {text: 'None', value: "None"}, 
      'neon-pink' :{text: 'Pink', value: "neon-pink"}, 
      'neon-blue' :{text: 'Blue', value: "neon-blue"}, 
      'neon-yellow' :{text: 'Yellow', value: "neon-yellow"},
      'neon-green' :{text: 'Green', value: "neon-green"}, 
      'neon-white' :{text: 'White', value: "neon-white"}, 
    }



  const [currentTableTheme, setCurrentTableTheme] = useState('')
  const [currentNeonTheme, setCurrentNeonTheme] = useState('')





  useEffect(() => {

    console.log(tableTheme);



    if(neonTheme){
      setCurrentNeonTheme(neonList[neonTheme])
    }

    if(tableTheme){
      setCurrentTableTheme(tableTheme || 'none')
    }


  }, []);

// preload images
  useEffect(() => {
    if(themes && Object.values(themes).length){
      let currThemes = Object.entries(themes)
      currThemes.forEach(([key,src]) => {
        const img = new Image();
        img.src = src.url;
      });
    }
  }, [themes]);



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


  const saveSettings = () => {


handleTableThemeChange()
handleNeonThemeChange()
closeModal()
return
  }


  const handleTableThemeChange = () => {
    dispatch(changeTableThemeAction(currentTableTheme));
  };

  const handleNeonThemeChange = () => {
    dispatch(changeNeonThemeAction(currentNeonTheme.value));
  };


  const toggleNeonTheme = (direction) => {

    const neonKeys = Object.keys(neonList);
    let currentIndex = neonKeys.indexOf(currentNeonTheme.value);

    if (direction) {
      currentIndex = (currentIndex + 1) % neonKeys.length;
    } else {
      currentIndex = (currentIndex - 1 + neonKeys.length) % neonKeys.length;
    }
    const newNeonTheme = neonKeys[currentIndex];
    setCurrentNeonTheme(neonList[newNeonTheme])

  };

  const toggleTableTheme = (direction) => {

    const feltKeys = Object.keys(themes);
    let currentIndex = feltKeys.indexOf(currentTableTheme);
 

    console.log(currentTableTheme);
    console.log(feltKeys);
    console.log(currentIndex);
 
    if (currentIndex === -1) {
      currentIndex = 0;
    }

    if (direction) {
      currentIndex = (currentIndex + 1) % feltKeys.length;
    } else{
      currentIndex = (currentIndex - 1 + feltKeys.length) % feltKeys.length;
    }
    
    // Get the key for the new theme
    const newTableTheme = feltKeys[currentIndex];
    console.log(newTableTheme);
    console.log(themes[newTableTheme]);

    setCurrentTableTheme(themes[newTableTheme].name)


    
  };





  

  return (

    <div className='themesmodal-wrapper flex' ref={formRef}>

        <div className='themesmodal-header flex center'>
          Table Theme Settings
              
        </div>
      
        <div className='themesmodal-content flex center'>


          <div className='themesmodal-tableview flex center'>

            <div className={`themesmodal-table-content ${currentNeonTheme?.value}`}>

{currentTableTheme && currentTableTheme.name !== 'None' && themes?.[currentTableTheme]?.url &&   <div className='themesmodal-image-container'>
                <img src={themes?.[currentTableTheme]?.url} alt='table'></img>
              </div>}


            </div>

                
          </div>

          <div className='themesmodal-table-options flex'>

            <div className='themesmodal-option-container flex center'>
              <div onClick={()=>toggleTableTheme(0)} className='themesmodal-arrow flex center'>{'<'}</div>
              <div className='themesmodal-style flex center'>{currentTableTheme || 'None'}</div>
              <div onClick={()=>toggleTableTheme(1)} className='themesmodal-arrow flex center'>{'>'}</div>
            </div>        

            <div className='themesmodal-option-container flex center'>
              <div onClick={()=>toggleNeonTheme(0)} className='themesmodal-arrow  flex center'>{'<'}</div>
              <div className='themesmodal-style flex center'>{currentNeonTheme.text}</div>
              <div onClick={()=>toggleNeonTheme(1)} className='themesmodal-arrow  flex center'>{'>'}</div>
 
            </div>          





                
          </div>

          <div className='themesmodal-save-container flex center'>
              <div onClick={saveSettings} className='themesmodal-save-button  flex center'>Save and Close</div>
            </div>  




        </div>





    </div>

    
  )
}
export default ThemesModal