import React, { useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, Link,useHistory, useParams} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import feltGreen from '../../images/felt-green.jpeg'
// import feltGreen2 from '../../images/felt-green2.jpeg'
// import feltGreen3 from '../../images/felt-green3.jpeg'
import feltGreen4 from '../../images/felt-green4.jpeg'
// // import feltRed from '../../images/felt-red.svg'
// import feltRed from '../../images/felt-red-comp.png'
import TableSeat from '../TableSeat';

import './Table.css'

import PlayerBetOptions from '../PlayerBetOptions';

const Table = ({table, takeSeat, leaveSeat, leaveTable}) => {
  const {id} = useParams()
  const game = 'blackjack'
  const url = 'https://social-stakes.s3.us-west-1.amazonaws.com/AdobeStock_271559753.jpeg'


  const initialSeats = Array(6).fill(null);
  const [seats, setSeats] = useState(initialSeats);
  const seatOrder = [0, 5, 1, 4, 2, 3];
  // const orderedSeats = seatOrder.map(i => seats[i]);

  console.log(initialSeats);

  console.log(table);

  useEffect(() => {
    console.log('hurr');
    if(table &&  table.tableUsers){
    console.log('hurr');
    let newSeats = [...initialSeats];
      table.tableUsers.forEach(user => {
        console.log(user);
        if(user.seat && user.seat <= 6 && user.seat > 0) {
          newSeats[user.seat - 1] = user;
        } 
      });
      setSeats(newSeats);
    }

    // Clean up function 
    return () => {
      setSeats(initialSeats);
    };
  }, [table]);


 

  console.log(table);
  console.log(table?.Game);


  return (
    <div className='table-wrapper'>
    <div className='table-container '>
      <div className='table-content flex center neon'>
        {/* <img src={feltGreen4} alt='table'></img> */}
        <img src={url} alt='table'></img>
      </div>

{/*  
    {table && (
      <div className='seats-container'>
          <div className='top-seats flex between'>
            <div className='seat-container six-ring seat1' onClick={()=>takeSeat(1)}></div>
            <div className='seat-container six-ring seat6' onClick={()=>takeSeat(6)}></div>
          </div>
          <div className='mid-seats flex between'>
            <div className='seat-container six-ring seat2' onClick={()=>takeSeat(2)}></div>
            <div className='seat-container six-ring seat5' onClick={()=>takeSeat(5)}></div>
          </div>
          <div className='bot-seats flex between'>
            <div className='seat-container six-ring seat3' onClick={()=>takeSeat(3)}></div>
            <div className='seat-container six-ring seat4' onClick={()=>takeSeat(4)}></div>
          </div>
      </div>
    )} */}


        <div className='seats-container'>
          <div className='top-seats flex between'>
            <TableSeat seatNumber={1} player={seats[0]} onSeatClick={takeSeat} onLeaveClick={leaveSeat}/>
            <TableSeat seatNumber={6} player={seats[5]} onSeatClick={takeSeat} onLeaveClick={leaveSeat}/>
          </div>
          <div className='mid-seats flex between'>
            <TableSeat seatNumber={2} player={seats[1]} onSeatClick={takeSeat} onLeaveClick={leaveSeat}/>
            <TableSeat seatNumber={5} player={seats[4]} onSeatClick={takeSeat} onLeaveClick={leaveSeat}/>
          </div>
          <div className='bot-seats flex between'>
            <TableSeat seatNumber={3} player={seats[2]} onSeatClick={takeSeat} onLeaveClick={leaveSeat}/>
            <TableSeat seatNumber={4} player={seats[3]} onSeatClick={takeSeat} onLeaveClick={leaveSeat}/>
          </div>
        </div>


    </div>
    </div>
  )
}
export default Table