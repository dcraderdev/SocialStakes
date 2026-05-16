import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './JoinPrivateGameModal.css';
import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';
import * as gameActions from '../../redux/middleware/games';

function JoinPrivateGameModal() {
  const dispatch = useDispatch();
  const formRef = useRef(null);

  const [code, setCode] = useState('');
  const [showError, setShowError] = useState(false);
  const [hasId, setHasId] = useState(false);

  const { socket } = useContext(SocketContext);
  const { closeModal, updateObj, setUpdateObj } = useContext(ModalContext);

  useEffect(() => {
    if (updateObj && updateObj.tableId) {
      setHasId(true);
    }
  }, [updateObj]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        closeModal();
        setUpdateObj(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const joinTable = async (e) => {
    e.preventDefault();

    let join;
    if (hasId) {
      // Clicked a private table tile — join by tableId + code as password
      join = await dispatch(
        gameActions.joinPrivateTable(updateObj.tableId, null, code, socket)
      );
    } else {
      // No tableId — send code as password; backend will find the table by passCode
      join = await dispatch(
        gameActions.joinPrivateTable(null, null, code, socket)
      );
    }

    if (join && join.status > 200) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    closeModal();
    setUpdateObj(null);
  };

  const cancel = () => {
    closeModal();
    setUpdateObj(null);
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value.toUpperCase().slice(0, 6));
  };

  return (
    <div className="jointable-wrapper" ref={formRef}>
      <div className="jointable-container flex center">
        <div className="jointable-header white flex center">
          Join Private Game
        </div>
        {showError && (
          <div className="jointable-error red">Could not join table. Check the code and try again.</div>
        )}
        <form className="flex jointable-form" onSubmit={joinTable}>
          <input
            className="jointable-funding-input"
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="Enter 6-char join code"
            autoFocus
            maxLength={6}
          />
        </form>

        <div className="jointable-user-buttons flex between">
          <div className="jointable-cancel flex center" onClick={cancel}>
            Cancel
          </div>
          <div
            className={`jointable-addbalance flex center ${
              code.length === 0 ? ' disabled' : ''
            }`}
            onClick={(e) => joinTable(e)}
          >
            Join
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinPrivateGameModal;
