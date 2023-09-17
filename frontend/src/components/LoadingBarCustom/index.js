import React, { useState, useEffect } from 'react';
import './LoadingBarCustom.css';

function LoadingBarCustom({totalTime, endTimeStamp}) {
    const [progress, setProgress] = useState(null);
    const [millisecondsLeft, setMillisecondsLeft] = useState(null);


    useEffect(() => {
      if(!endTimeStamp) return
      setMillisecondsLeft(endTimeStamp - Date.now() - 100);
    }, [totalTime, endTimeStamp]);


    useEffect(() => {

      if(!millisecondsLeft) return
      let progLeft = (millisecondsLeft / 1000) / totalTime
      setProgress(`${(1-progLeft) * 100}%`)
      setTimeout(() => {
        setProgress('100%')
      }, 100);
  }, [millisecondsLeft]);

    return (
      <div className="custom-progress fade-in" style={{ '--progress': progress, '--duration': `${millisecondsLeft}ms` }}>
          <div className="custom-bar"></div>
      </div>
    );
}

export default LoadingBarCustom;
