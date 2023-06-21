import React, { useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, Link,useHistory, useParams} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import feltGreen from '../../images/felt-green.jpeg'
// import feltGreen2 from '../../images/felt-green2.jpeg'
// import feltGreen3 from '../../images/felt-green3.jpeg'
// import feltGreen4 from '../../images/felt-green4.jpeg'
// // import feltRed from '../../images/felt-red.svg'
// import feltRed from '../../images/felt-red-comp.png'
import TableSeat from '../TableSeat';
import {changeNeonThemeAction, changeTableThemeAction} from '../../redux/actions/userActions';



import './Table.css'

import PlayerBetOptions from '../PlayerBetOptions';

const Table = ({table, takeSeat, leaveSeat, leaveTable}) => {

  const dispatch = useDispatch()
  const game = 'blackjack'
  // const url1 = 'https://social-stakes.s3.us-west-1.amazonaws.com/felt-green4%20%281%29.jpeg?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGkaCXVzLXdlc3QtMSJGMEQCIEPYRnhn7zjO5CmfZIcUNV%2FbteiimkK4GNA%2BkMSSCpmhAiAE9LyMisKabrgV%2Bq4OTVD9VHP25lXrwwB%2Bfak%2Ft36GGCrtAgjC%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDY2OTgyMzM2MTE5MiIMiduXkocd4D0urcUCKsECZYZbOffqLDO7gAR3tO4x1uutMSeg5dSqodcgfsutTanVCnJ5Q48PPQUAoFskKYWE3MkP7rUqzxtzo4zgJasoFLDKL3Mbpz%2BovniiXHkY6SNwbypEKV3jW2SdtEmmg3BAYCEARGzm4JbydrPThx8ngfGD0cPQ5gauGYiMtTql%2B5b1WJwwbGSaKFOHBLXthrzw7ZJymSABq75442JtMhPU%2Boom2PsagWEmvh4ZHCNSjR2jSV6yf77E0oqy0nWHd%2BAaBOzsvj9tlcj4YM%2B6SNO2%2BxyaNWa1ujmh0NMqwtXfJk5VP8yw0XRR2a65urC4HUP8VSZE7qPoBcgcVIWn53xFtrfr6aAic8yF559o%2B9jDugMn4SAKyGOOdENBpdN5Nu4TC8IuKzLgVAmyxzqU6kVdpD3VNLBGCDiEvkX14GUGncZ9MLjdzKQGOrQCT7SRASFLfW1GYZt7SeTn6WNikNDFNVZ5mASHIANrvKCty28Cv2bXh0hIT%2F%2BDpLAvYvZvwULRl8meHjF01%2Fs6Sw9J978eWNws7OlPkYvCJKZwnmorX6L2qknBwZZ6P5t1wigMC6kNAg6aUgShQKsMDKYufTBFuj%2BQBTbw%2Bkj4DFmD4QDBIhDqDricZy%2F1DxBwXbsE6jYxVCu4MV3a9lWww1PONFDQK7e%2FvPpyxLOIbuo7X%2FP9cNp6vU9Yoe5De%2F%2BUekpVeyQz3k0rwqKDA92OjZ3Xd7k8j5RrnKMABsTInJ555JTaN%2BsVUatvhDVM%2Bsx0oKlRUUhmiKYAi2UyC5kFwlSNgsGPrROhkomByPTsW8Sosce%2Be72BPbFh1EHLERej8IOOGlNLrye3GOsI2Qbb6LS3bzg%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230621T173527Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZX5EVMCUEQCNYFSP%2F20230621%2Fus-west-1%2Fs3%2Faws4_request&X-Amz-Signature=c0da1b326c46a7128a0ebbe18f7572a260ce620f32425edd65a0d77c4f907599'
  // const url2 = 'https://social-stakes.s3.us-west-1.amazonaws.com/image_adobe_express%20%281%29%20%281%29.jpeg?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGkaCXVzLXdlc3QtMSJGMEQCIEPYRnhn7zjO5CmfZIcUNV%2FbteiimkK4GNA%2BkMSSCpmhAiAE9LyMisKabrgV%2Bq4OTVD9VHP25lXrwwB%2Bfak%2Ft36GGCrtAgjC%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDY2OTgyMzM2MTE5MiIMiduXkocd4D0urcUCKsECZYZbOffqLDO7gAR3tO4x1uutMSeg5dSqodcgfsutTanVCnJ5Q48PPQUAoFskKYWE3MkP7rUqzxtzo4zgJasoFLDKL3Mbpz%2BovniiXHkY6SNwbypEKV3jW2SdtEmmg3BAYCEARGzm4JbydrPThx8ngfGD0cPQ5gauGYiMtTql%2B5b1WJwwbGSaKFOHBLXthrzw7ZJymSABq75442JtMhPU%2Boom2PsagWEmvh4ZHCNSjR2jSV6yf77E0oqy0nWHd%2BAaBOzsvj9tlcj4YM%2B6SNO2%2BxyaNWa1ujmh0NMqwtXfJk5VP8yw0XRR2a65urC4HUP8VSZE7qPoBcgcVIWn53xFtrfr6aAic8yF559o%2B9jDugMn4SAKyGOOdENBpdN5Nu4TC8IuKzLgVAmyxzqU6kVdpD3VNLBGCDiEvkX14GUGncZ9MLjdzKQGOrQCT7SRASFLfW1GYZt7SeTn6WNikNDFNVZ5mASHIANrvKCty28Cv2bXh0hIT%2F%2BDpLAvYvZvwULRl8meHjF01%2Fs6Sw9J978eWNws7OlPkYvCJKZwnmorX6L2qknBwZZ6P5t1wigMC6kNAg6aUgShQKsMDKYufTBFuj%2BQBTbw%2Bkj4DFmD4QDBIhDqDricZy%2F1DxBwXbsE6jYxVCu4MV3a9lWww1PONFDQK7e%2FvPpyxLOIbuo7X%2FP9cNp6vU9Yoe5De%2F%2BUekpVeyQz3k0rwqKDA92OjZ3Xd7k8j5RrnKMABsTInJ555JTaN%2BsVUatvhDVM%2Bsx0oKlRUUhmiKYAi2UyC5kFwlSNgsGPrROhkomByPTsW8Sosce%2Be72BPbFh1EHLERej8IOOGlNLrye3GOsI2Qbb6LS3bzg%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230621T174147Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZX5EVMCUEQCNYFSP%2F20230621%2Fus-west-1%2Fs3%2Faws4_request&X-Amz-Signature=9c586244799573d89c7a51cd350a19d6ca5b3a2dff9e76de1f2b7c4e97974450'
  // const url3 = 'https://social-stakes.s3.us-west-1.amazonaws.com/image_adobe_express%20%282%29%20%281%29.jpeg?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGkaCXVzLXdlc3QtMSJGMEQCIEPYRnhn7zjO5CmfZIcUNV%2FbteiimkK4GNA%2BkMSSCpmhAiAE9LyMisKabrgV%2Bq4OTVD9VHP25lXrwwB%2Bfak%2Ft36GGCrtAgjC%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDY2OTgyMzM2MTE5MiIMiduXkocd4D0urcUCKsECZYZbOffqLDO7gAR3tO4x1uutMSeg5dSqodcgfsutTanVCnJ5Q48PPQUAoFskKYWE3MkP7rUqzxtzo4zgJasoFLDKL3Mbpz%2BovniiXHkY6SNwbypEKV3jW2SdtEmmg3BAYCEARGzm4JbydrPThx8ngfGD0cPQ5gauGYiMtTql%2B5b1WJwwbGSaKFOHBLXthrzw7ZJymSABq75442JtMhPU%2Boom2PsagWEmvh4ZHCNSjR2jSV6yf77E0oqy0nWHd%2BAaBOzsvj9tlcj4YM%2B6SNO2%2BxyaNWa1ujmh0NMqwtXfJk5VP8yw0XRR2a65urC4HUP8VSZE7qPoBcgcVIWn53xFtrfr6aAic8yF559o%2B9jDugMn4SAKyGOOdENBpdN5Nu4TC8IuKzLgVAmyxzqU6kVdpD3VNLBGCDiEvkX14GUGncZ9MLjdzKQGOrQCT7SRASFLfW1GYZt7SeTn6WNikNDFNVZ5mASHIANrvKCty28Cv2bXh0hIT%2F%2BDpLAvYvZvwULRl8meHjF01%2Fs6Sw9J978eWNws7OlPkYvCJKZwnmorX6L2qknBwZZ6P5t1wigMC6kNAg6aUgShQKsMDKYufTBFuj%2BQBTbw%2Bkj4DFmD4QDBIhDqDricZy%2F1DxBwXbsE6jYxVCu4MV3a9lWww1PONFDQK7e%2FvPpyxLOIbuo7X%2FP9cNp6vU9Yoe5De%2F%2BUekpVeyQz3k0rwqKDA92OjZ3Xd7k8j5RrnKMABsTInJ555JTaN%2BsVUatvhDVM%2Bsx0oKlRUUhmiKYAi2UyC5kFwlSNgsGPrROhkomByPTsW8Sosce%2Be72BPbFh1EHLERej8IOOGlNLrye3GOsI2Qbb6LS3bzg%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230621T174557Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZX5EVMCUEQCNYFSP%2F20230621%2Fus-west-1%2Fs3%2Faws4_request&X-Amz-Signature=1f2b835ac90c4a4f2216d6d1b1b360c8a303982d55a2e0465184105f887aabe8'
  // const url4 = 'https://imgprd19.hobbylobby.com/5/2f/df/52fdfe9b8113b6a9d11308bcd26151380149d822/350Wx350H-728378-1020.jpg'
  const themes = useSelector(state=>state.users.themes)
  const neonTheme = useSelector(state=>state.users.neonTheme)
  const tableTheme = useSelector(state=>state.users.tableTheme)


  const initialSeats = Array(6).fill(null);
  const [seats, setSeats] = useState(initialSeats);
  const seatOrder = [0, 5, 1, 4, 2, 3];

console.log(themes);
console.log(tableTheme);
console.log(themes[tableTheme]);

  useEffect(() => {
    if(table &&  table.tableUsers){
    let newSeats = [...initialSeats];
      table.tableUsers.forEach(user => {
        if(user.seat && user.seat <= 6 && user.seat > 0) {
          newSeats[user.seat - 1] = user;
        } 
      });
      setSeats(newSeats);
    }

    return () => {
      setSeats(initialSeats);
    };
  }, [table]);

  const handleTableThemeChange = (tableTheme) =>{
    console.log(tableTheme);
    console.log('click');
    dispatch(changeTableThemeAction(tableTheme))
  }



  return (
    <div className='table-wrapper'>
    <div className='table-container '>
      <div className='table-content flex center'>
        {/* <img src={feltGreen4} alt='table'></img> */}
        {themes[tableTheme] && <img src={themes[tableTheme].url} alt='table'></img>}
      </div>



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

    <div className='flex'>
      <div className='theme-button' onClick={()=>handleTableThemeChange('black')}>black</div>
      <div className='theme-button' onClick={()=>handleTableThemeChange('darkgreen')}>darkgreen</div>
      <div className='theme-button' onClick={()=>handleTableThemeChange('lightgreen')}>lightgreen</div>
      <div className='theme-button' onClick={()=>handleTableThemeChange('red')}>red</div>
      <div className='theme-button' onClick={()=>handleTableThemeChange('realfelt')}>realfelt</div>
    </div>

    </div>
    </div>
  )
}
export default Table