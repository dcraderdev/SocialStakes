import { React } from 'react';
import socialstakesCards2 from '../../images/socialstakes-logo-cards2.svg'
import './Logo.css'

const Logo = () => {

  return (
    <div className='main-logo-container flex'>


      <div className='main-logo-image-container flex center'>
        <img src={socialstakesCards2} alt="cards"></img>
        <div className='main-logo-name flex center'>SOCIAL STAKES</div> 
      </div>
      



    </div>
  )
}
export default Logo