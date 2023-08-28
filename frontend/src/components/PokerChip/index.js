import { React, useState, useRef, useEffect, useContext } from 'react';
import './PokerChip.css'

// import pokerChip from '../../images/poker-chip.svg'
// import pokerChipWithDollarSign from '../../images/poker-chip-with-dollar-sign.svg'
// import blackPokerChip from '../../images/black-poker-chip.svg'
// import goldPokerChip from '../../images/gold-poker-chip.svg'
// import bluePokerChip from '../../images/blue-poker-chip.svg'
// import redPokerChip from '../../images/red-poker-chip.svg'


const PokerChip = ({amount}) => {

// let testAmount = 50000
const [displayAmount, setDisplayAmount] = useState(null)


// useEffect(() => {
//   const image = new Image();
//   image.src = bluePokerChip;
// }, []);

useEffect(() => {
  let newAmount;
  if (amount > 1000) {
    const inThousands = amount / 1000;
    const truncated = Math.floor(inThousands * 10) / 10;
    newAmount = `${truncated}k`;
  } else {
    newAmount = amount.toString();
  }
  setDisplayAmount(newAmount);
}, [amount]);


  // return (
  //   <div className='pokerchip-container flex center'>
  //     <img className='pokerchip-chip' src={bluePokerChip} alt={`Bet amount: ${amount}`} />
  //     <div className='pokerchip-amount'>{displayAmount}</div>
  //   </div>
  // )

  return (
    <div className='pokerchip-container flex center'>
      <div className='pokerchip-amount'>{displayAmount}</div>
    </div>
)


}
export default PokerChip