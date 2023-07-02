import React, { useEffect, useState } from 'react';
import './Card.css';

import cardConverter from '../../utils/cardConverter'
import {suitToSymbol, rankToLetter} from '.';



function Card({card}) {
  const [convertedCard, setConvertedCard] = useState({})
  const [suit, setSuit] = useState('')
  const [rank, setRank] = useState('')

  useEffect(()=>{
    if(card === 'hidden'){return}

    setConvertedCard(()=>{
      return cardConverter[card]
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

  return (
    <div className="card">
      <div className={`card-suit ${suit}`}>{rank}{suit}</div>
      <div className="card-rank">{rank}</div>
      <div className="card-suit-flip">{rank}{suit}</div>
    </div>
  )
}



export default Card;




