import React, { useState, useRef, useEffect } from 'react';
import { Route, Router, Switch, NavLink, useHistory, useParams } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux'

import * as gameActions from '../../redux/middleware/games';
import * as userActions from '../../redux/middleware/users';

import './TableTile.css'

const TableTile = ({table, back}) => {

  const { gameId } = useParams();
  const history = useHistory()
  const dispatch = useDispatch()
  const [seat1, setSeat1] = useState(false)
  const [seat2, setSeat2] = useState(false)
  const [seat3, setSeat3] = useState(false)
  const [seat4, setSeat4] = useState(false)
  const [seat5, setSeat5] = useState(false)
  const [seat6, setSeat6] = useState(false)
  const seatSetters = [setSeat1, setSeat2, setSeat3, setSeat4, setSeat5, setSeat6];
  const seats = [seat1, seat2, seat3, seat4, seat5, seat6];

console.log(table.players);


  // Update seat states based on table.players array
  useEffect(() => {
    if (table) {
      seatSetters.forEach(setSeat => setSeat(false));

      table.players.forEach(player => {
        const seatNumber = player.UserTables.seat;
        if (seatNumber > 0) {
          seatSetters[seatNumber - 1](player.firstName[0]+player.firstName[1]+player.firstName[2]);
        }
      });
    }
  }, [table]);

 

  console.log(seat1);
  console.log(seat2);
  console.log(seat3);
  console.log(seat4);
  console.log(seat5);
  console.log(seat6);



  const joinTable = async (seat) => {

    console.log('attempting to join table:', table.id, '@ seat:', seat);

    try{
      const takeSeat = await dispatch(gameActions.joinTable(table.id, seat))
      if(takeSeat){
        console.log(takeSeat);
        return history.push(`/table/${table.id}`);
      }
    }catch(error){
      console.log(error);
    }




  };
  

  const watchTable = () => {
    return history.push(`/table/${table.id}`);
  };

  

  return (
    <>
      <div>
      <div className='back-button button' onClick={()=>{back()}}>Back</div>

        <div className="table-tile">
          <div className='table-tile-table' onClick={watchTable}></div>
          <div className='table-tile-seat six-handed-seat1' onClick={()=>joinTable(1)}>{seat1}</div>
          <div className='table-tile-seat six-handed-seat2' onClick={()=>joinTable(2)}>{seat2}</div>
          <div className='table-tile-seat six-handed-seat3' onClick={()=>joinTable(3)}>{seat3}</div>
          <div className='table-tile-seat six-handed-seat4' onClick={()=>joinTable(4)}>{seat4}</div>
          <div className='table-tile-seat six-handed-seat5' onClick={()=>joinTable(5)}>{seat5}</div>
          <div className='table-tile-seat six-handed-seat6' onClick={()=>joinTable(6)}>{seat6}</div>
        </div>
      </div>
    </>
  )
}
export default TableTile