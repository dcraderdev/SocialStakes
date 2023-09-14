import { React } from 'react';
import socialstakesCards2 from '../../images/socialstakes-logo-cards2.svg'
import Logo from '../Logo';
import './ComingSoonImage.css'

const ComingSoonImage = () => {

  return (
    <div className='comingsoonimage-container comingsoonimage flex'>
      <Logo />
      <div className='comingsoonimage-name flex center'>Stats coming soon!</div>
    </div>
  )
}
export default ComingSoonImage