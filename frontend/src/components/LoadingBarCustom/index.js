import React, { useState, useEffect } from 'react';
import './LoadingBarCustom.css';

function LoadingBarCustom({time}) {

  const [progress, setProgress] = useState('0%');

  useEffect(() => {
      setProgress('100%');
  }, []);



  return (
    <div className="progress fade-in" style={{ '--progress': progress }}>
      <div className="bar"></div>
    </div>
  );
}

export default LoadingBarCustom;
