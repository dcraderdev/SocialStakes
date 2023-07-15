import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect, useHistory } from 'react-router-dom';
import './JoinPrivateGameModal.css';
import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';
import * as sessionActions from '../../redux/middleware/users';
import * as gameActions from '../../redux/middleware/games';
import { showGamesAction } from '../../redux/actions/gameActions';

function JoinPrivateGameModal() {
  const dispatch = useDispatch();
  const history = useHistory();
  const formRef = useRef(null);

  const [password, setPassword] = useState('');
  const [tableId, setTableId] = useState('');
  const [tableName, setTableName] = useState('');
  const [showError, setShowError] = useState(false);

  const { socket } = useContext(SocketContext);
  const { modal, openModal, closeModal, updateObj, setUpdateObj } =
    useContext(ModalContext);

  const user = useSelector((state) => state.users.user);
  const balance = useSelector((state) => state.users.balance);
  const table = useSelector((state) => state.games.activeTable);

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

  const joinTable = async () => {
    let join = await dispatch(
      gameActions.joinPrivateTable(tableId, tableName, password, socket)
    );
    if (join) {
      console.log(join);
      if (join.status > 200) {
        setShowError(true);
        setTimeout(() => {
          setShowError(false);
        }, 3000);
      }
    }
    closeModal()
    setUpdateObj(null);
  };

  const cancel = () => {
    closeModal();
    setUpdateObj(null);
  };

  return (
    <div className="jointable-wrapper" ref={formRef}>
      <div className="jointable-container flex center">
        <div className="jointable-header white flex center">
          Join Private Game
        </div>
        {showError && (
          <div className="jointable-error red">Could not join table.</div>
        )}
        <form className="flex jointable-form" onSubmit={joinTable}>
          <input
            className="jointable-funding-input"
            type="text"
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            placeholder="Enter table id"
          />
          <input
            className="jointable-funding-input"
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Enter table name"
          />
          <input
            className="jointable-funding-input"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter table passcode"
          />
        </form>

        <div className="jointable-user-buttons flex between">
          <div className="jointable-cancel flex center" onClick={cancel}>
            Cancel
          </div>
          <div
            className={`jointable-addbalance flex center ${
              password.length === 0 ? ' disabled' : ''
            }`}
            onClick={joinTable}
          >
            Submit
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinPrivateGameModal;
