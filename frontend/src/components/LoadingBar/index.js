import React, { useState, useEffect } from 'react';
import './LoadingBar.css';

function LoadingBar({isLoaded}) {
  const [progress, setProgress] = useState('0%');

  useEffect(() => {
      setProgress('50%');
  }, []);

  useEffect(() => {
    if(isLoaded){
        setProgress('100%');
    }
  }, [isLoaded]);

  return (
    <div className="progress fade-in" style={{ '--progress': progress }}>
      <div className="bar"></div>
    </div>
  );
}

export default LoadingBar;
