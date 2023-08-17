import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ModalContext } from '../../context/ModalContext';

import './AboutMeModal.css';

import profilePic from '../../images/profilepic_donovan.jpeg';
import portfolioImg from '../../images/portfolio-img.png';

const AboutMeModal = () => {
  const { closeModal } = useContext(ModalContext);
  const dispatch = useDispatch();
  const formRef = useRef();

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


  const navTo = (location) => {
    switch(location) {
      case 'linkedin':
        window.open('https://www.linkedin.com/in/donovan-crader-898413242/', '_blank');
        break;
      case 'github':
        window.open('https://github.com/dcraderdev/SocialStakes/wiki', '_blank');
        break;
      case 'portfolio':
        window.open('https://donovancrader.dev/', '_blank');
        break;
      default:
        break;
    }
  }






  return (
    <div className="aboutmemodal-wrapper flex" ref={formRef}>
      <div className="aboutmemodal-header flex">
        <div className="aboutmemodal-photo-container flex center">
          <div className="aboutmemodal-photo">
            <img src={profilePic} alt="photo" />
          </div>

          <div className={`aboutmemodal-photo skeleton`}></div>
        </div>

        <div className="aboutmemodal-welcome memo flex center">
        <div className="welcome-content">
            Hey there!
          </div>
          <div className="welcome-content">
            I'm Donovan Crader, the mind behind this gaming haven.
          </div>

        </div>
      </div>

      <div className="aboutmemodal-content flex center">
        <div className="content-container flex  center">
          <div className="content-icon" >
            <div className="aboutmemodal-icon flex" onClick={() => navTo('github')}>
              <i className="fa-brands fa-github"></i>
            </div>
          </div>




          <div className="content-message flex center">
            <div className="content-link" onClick={() => navTo('github')}>Interested in the code magic behind this site?</div>
          </div>
        </div>

        <div className="content-container flex  center">
          <div className="content-icon">
            <div className="aboutmemodal-icon flex center"  onClick={() => navTo('portfolio')}>
              <img
                src={portfolioImg}
                alt="portfolio-logo"
                className="fa-brands fa-linkedin"
              ></img>
            </div>
          </div>

          <div className="content-message flex center">
            <div className="content-link"  onClick={() => navTo('portfolio')}>Dive into my world of creations.</div>
          </div>
        </div>

        <div className="content-container flex center">
          <div className="content-icon">
            <div className="aboutmemodal-icon"  onClick={() => navTo('linkedin')}>
              <i className="fa-brands fa-linkedin"></i>
            </div>
          </div>




          <div className="content-message flex center">
            <div className="content-link"  onClick={() => navTo('linkedin')}>Have questions or interested in a collaboration?</div>
          </div>


        </div>
      </div>
    </div>
  );
};
export default AboutMeModal;
