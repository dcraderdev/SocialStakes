import React, { useEffect, useState } from 'react';
import './GameBarCard.css';

import cardConverter from '../../utils/cardConverter'
import {suitToSymbol, rankToLetter} from '.';



function GameBarCard({card}) {
  const [convertedCard, setConvertedCard] = useState({})
  const [suit, setSuit] = useState('')
  const [rank, setRank] = useState('')

  console.log(card);


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

  console.log(card);

  return (
    <div className="gamebarcard">
      <div className="gamebarcard-rank">{rank}</div>
      <div className={`gamebarcard-suit ${suit}`}>{suit}</div>
    </div>
  )
}
 
 

export default GameBarCard;




