import React, { createContext, useEffect, useState, useRef } from 'react';

export const WindowContext = createContext();

export const WindowProvider = ({ children }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [scrollPosition, setScrollPosition] = useState(window.scrollY);
  const profileBtnRef = useRef()

  useEffect(() => {


    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
 
    
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);



  return (
    <WindowContext.Provider value={ {windowHeight, windowWidth, scrollPosition, profileBtnRef} }>
      {children}
    </WindowContext.Provider>
  );
};
