import Card from './Card';

export function suitToSymbol(suit) {
  switch (suit) {
    case 'spade':
      return '♠️';
    case 'heart':
      return '♥️';
    case 'club':
      return '♣️';
    case 'diamond':
      return '♦️';
    default:
      return '';
  }
}

export function rankToLetter(rank) {

  switch (rank) {
    case 11:
      return "J";
    case 12:
      return "Q";
    case 13:
      return "K";
    case 14:
      return "A";
    default:
      return rank.toString();
  }
}

export default Card;


