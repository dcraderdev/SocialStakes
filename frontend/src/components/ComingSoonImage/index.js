import { React } from 'react';
import socialstakesCards2 from '../../images/socialstakes-logo-cards2.svg'
import './ComingSoonImage.css'

const ComingSoonImage = () => {

  return (
    <div className='comingsoon-container flex'>
      <div className='comingsoon-image-wrapper flex center'>
      <div className='comingsoon-image-container flex center'>
        <img src={socialstakesCards2} alt="cards"></img>
      </div>
        <div className='comingsoon-name flex center'>SOCIAL STAKES</div> 
      <div className='comingsoon-banner flex center'>Stats coming soon</div>
      </div>
    </div>
  )
}
export default ComingSoonImage