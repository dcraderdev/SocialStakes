import React, { useEffect, useState } from 'react';
import './Card.css';

import cardConverter from '../../utils/cardConverter'
import {suitToSymbol, rankToLetter} from '.';



function Card({card}) {
  const classic = 'classic'
  const easyView = 'easyView'
 
  let cardTheme

  // cardTheme = classic
  cardTheme = easyView



  const [convertedCard, setConvertedCard] = useState({})
  const [suit, setSuit] = useState('')
  const [rank, setRank] = useState('')

  useEffect(()=>{
    if(card === 'hidden'){return}

    setConvertedCard(()=>{
      let modCard = card % 51
      return cardConverter[modCard]
    })
  },[card])

  useEffect(()=>{
    if(convertedCard === {}) return
    setSuit(()=>suitToSymbol(convertedCard.suit))
    setRank(()=>rankToLetter(convertedCard.rank))
  },[convertedCard])



  if(card === 'hidden'){
    return (
      <div className="card hidden">
      </div>
    )
  }


  if(cardTheme === classic){
    return (
      <div className="card">
        <div className={`card-suit ${suit}`}>{rank}{suit}</div>
        <div className="card-rank">{rank}</div>
        <div className="card-suit-flip">{rank}{suit}</div>
      </div>
    )
  }

  if(cardTheme === easyView){
    return (
      <div className="card">
        <div className="easy-view card-rank">{rank}{suit}</div>
        <div className={`easy-view card-suit ${suit}`}>{suit}</div>
        <div className=" easy-view card-rank-flip">{rank}{suit}</div>
      </div>
    )
  }

  // return (
  //   <div className="card">
  //     <div className={`card-suit ${suit}`}>{rank}{suit}</div>
  //     <div className="card-rank">{rank}</div>
  //     <div className="card-suit-flip">{rank}{suit}</div>
  //   </div>
  // )
}



export default Card;




