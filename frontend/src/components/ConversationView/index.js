import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import './ConversationView.css'

const ConversationView = ({conversation}) => {

  const history = useHistory()
  const dispatch = useDispatch();

  console.log(conversation);



  return (
    <div className='conversationview-wrapper'>

      <div className='conversationview-container'>




      </div>


    </div>
  )
}
export default ConversationView