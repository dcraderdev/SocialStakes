import React, { useEffect, useState } from 'react';
import './Card.css';

import cardConverter from './cardConverter'
import {suitToSymbol, rankToLetter} from '.';



function Card({card}) {

  const [convertedCard, setConvertedCard] = useState({rank: '14', suit: 'spade', value: 11})
  const [suit, setSuit] = useState('')
  const [rank, setRank] = useState('')

  useEffect(()=>{
    if(card){
      setConvertedCard(()=>{
        return cardConverter[card]
      })
    }
  },[card])



  useEffect(()=>{
    setSuit(()=>suitToSymbol(convertedCard.suit))
    setRank(()=>rankToLetter(convertedCard.rank))
  },[convertedCard])


  return (
    <div className="card">
      <div className={`card-suit ${suit}`}>{rank}{suit}</div>
      <div className="card-rank">{rank}</div>
      <div className="card-suit-flip">{rank}{suit}</div>
    </div>
  )
}



export default Card;




