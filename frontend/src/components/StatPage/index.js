import { React, useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';

import { getUserStats, getUserTables } from '../../redux/middleware/stats';

import './StatPage.css';

const StatPage = () => {
  const { socket } = useContext(SocketContext);
  const { modal, openModal, closeModal, updateObj, setUpdateObj } =
    useContext(ModalContext);

  const dispatch = useDispatch();

  const activeTable = useSelector((state) => state.games.activeTable);
  const currentTables = useSelector((state) => state.games.currentTables);
  const user = useSelector((state) => state.users.user);
  const balance = useSelector((state) => state.users.balance);
  const stats = useSelector((state) => state.stats);
  const history = useSelector((state) => state.stats.history);

  const [hasCurrentTables, setHasCurrentTables] = useState(false);

  useEffect(() => {
    setHasCurrentTables(Object.entries(currentTables).length > 0);
  }, [currentTables]);

  useEffect(() => {
    dispatch(getUserTables());
  }, []);

  if (!user) return;

  const sessions = stats && stats.sessionStats ? Object.entries(stats.sessionStats) : [];
  const hasSessions = sessions.length > 0;

  return (
    <div
      className={`statpage-container ${
        hasCurrentTables ? '' : 'extended'
      } flex`}
    >
      {!hasSessions && (
        <div className="statpage-empty">
          <div className="ss-empty">
            <div className="ss-empty-icon">📊</div>
            <p className="ss-empty-title">No session stats yet</p>
            <p className="ss-empty-body">
              Sit down at a table and play a few hands — your sessions, win rate, and best moments will show up here.
            </p>
            <div className="ss-empty-action">
              <NavLink to="/" className="ss-btn ss-btn-primary">
                Browse tables
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {hasSessions && (
        <div className="statpage-bottom-container flex">
          <div className="statpage-table-history-container">
            <div className="statpage-table-history-header flex center">
              <div className='statpage-header start'>Start</div>
              <div className='statpage-header table'>Table</div>
              <div className='statpage-header hands'>Hands</div>
              <div className='statpage-header result'>Result</div>
            </div>

            {sessions.map(([key, table], index) => (
              <div className='statspage-table-wrapper flex' key={index}>
                <div className='statpage-data start'>{table.startTime}</div>
                <div className='statpage-data table'>{table.tableName}</div>
                <div className='statpage-data table'>{table.minBet}/{table.maxBet}</div>
                <div className='statpage-data hands'>{table.totalHandsPlayed}</div>
                <div className='statpage-data result'>{table.timeAtTable}</div>
                <div className='statpage-data result'>{table.totalProfitLoss}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default StatPage;

// date range
// game type

// first view is view of sesssions. started when player creates a userTable, ends when they leave seat and userTable active goes to false

// second view is hand history of all hands played at that userTable/table depending on game type
// show all cards in play for each hand that has played, show each action and what applicable info along with it (ie a blackjack hit, show the card that was taken)
