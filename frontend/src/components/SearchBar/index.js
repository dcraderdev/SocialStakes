import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import './SearchBar.css'

import magnifyGlass from '../../images/magnify-glass.svg';
import magnifyGlassBlack from '../../images/magnify-glass-black.svg';

import { WindowContext } from '../../context/WindowContext';

const SearchBar = () => {
  const { searchInputRef } = useContext(WindowContext);
  const [search, setSearch] = useState('');


  const newSearch = async () => {
    console.log(search);
    setSearch('');
    // dispatch(sessionActions.search(search));
  };

  return (
    <div className='nav-search-container flex'>

      <div className="maginfy-container" onClick={newSearch}>
        <img
          className=""
          src={magnifyGlass}
          alt="medium cirlce logo"
        />
      </div>

<div className='nav-search-bar flex'>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        newSearch();
        setSearch('');
      }}
    >
      <label>
        <input
          ref={searchInputRef}
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          required
          placeholder={'Search Social Stakes'}
        />
      </label>
    </form>

</div>







  </div>
  )
}
export default SearchBar