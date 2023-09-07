import { React } from 'react';
import socialstakesCards2 from '../../images/socialstakes-logo-cards2.svg'
import './Logo.css'

const Logo = () => {

  return (
    <div className='comingsoon-container flex'>


      <div className='comingsoon-image-container flex center'>
        <img src={socialstakesCards2} alt="cards"></img>
        <div className='comingsoon-name flex center'>SOCIAL STAKES</div> 
      </div>
      



    </div>
  )
}
export default Logo