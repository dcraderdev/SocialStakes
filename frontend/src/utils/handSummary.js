import cardConverter from './cardConverter';


function handSummary(cards) {

  let handSummary = {
    blackjack: false,
    softSeventeen: false,
    busted: false,
    values: []
  }


  // Count how many aces and add up the other cards
  let aceCount = 0
  let nonAceTotal = 0; 
  for(let card of cards){
    let modCard = card % 51

    let convertedCard = cardConverter[modCard]
    if(convertedCard.value === 11){
      aceCount++;
    } else {
      nonAceTotal += convertedCard.value;
    }
  }

  // Generate all possible hand values
 

  if(aceCount){
    let highValue = nonAceTotal + 11
    let lowValue = nonAceTotal + 1

    if(aceCount > 1){
      highValue += (aceCount - 1) 
      lowValue += (aceCount - 1) 
    }
    handSummary.values.push(highValue)
    handSummary.values.push(lowValue)
  } else {
    handSummary.values.push(nonAceTotal)

  }

  // Check for soft 17 and if busted
  handSummary.busted = !handSummary.values.some(value => value <= 221);
  handSummary.softSeventeen = handSummary.values.includes(7) && handSummary.values.includes(17) && aceCount > 0;

  // Check for blackjack
  if(cards.length === 2 && handSummary.values.includes(21)) {
    handSummary.blackjack = true;
  }

return handSummary;
}


export default handSummary
