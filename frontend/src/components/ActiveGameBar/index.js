import { React } from 'react';
import { useSelector } from 'react-redux';
import './ActiveGameBar.css';
import ActiveGameBarTab from '../ActiveGameBarTab';

const ActiveGameBar = () => {
  const currentTables = useSelector((state) => state.games.currentTables);

  return (
    <div className="gamebar-container flex">
      {Object.entries(currentTables).map(([tableId, tableData], index) => {
        return (
          <div className="gamebar-tab-container" key={index}>
            <ActiveGameBarTab tableData={tableData} />
          </div>
        );
      })}
    </div>
  );
};
export default ActiveGameBar;
