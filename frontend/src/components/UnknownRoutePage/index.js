import React from 'react'
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import socialstakesCards2 from '../../images/socialstakes-logo-cards2.svg'
import * as gameActions from '../../redux/actions/gameActions';
import './UnknownRoutePage.css'


const UnknownRoutePage = () => {
  const history = useHistory()
  const dispatch = useDispatch();
  const handleLogoClick = () => {
    dispatch(gameActions.showGamesAction())
    history.push('/');
  };

  return (
    <div className='unknown-container flex center'>

      <div className='unknown-text-container flex center'>

        <div className='unknown-text flex center'>Lost? Casino's that way.</div>
        <div className='unknown-arrow flex center' onClick={handleLogoClick}><i class="fa-solid fa-arrow-right"></i></div>
      </div>

      <div 
        className='unknown-image-container flex' 
        onClick={handleLogoClick} 
      />

    </div>
  )
}
export default UnknownRoutePage

