import React, { useState, useEffect, useCallback } from 'react';
import styles from './TravelerSearchBar.module.css';
import search_icon_grey from '../../../assets/common/search_grey.svg';
import search_icon_white from '../../../assets/common/search_white.svg';

import search_clear_icon from '../../../assets/common/close.svg';

export default function TravelerSearchBar({
  placeholder = "",
  value = "",
  onSearchChange = () => {},
  onFocus = () => {},
  debounceMs = 300,
  isSearch,
  setIsSearch,
  barWidth = "80%"
}) {
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      onSearchChange(searchValue);
    }, debounceMs),
    [onSearchChange, debounceMs]
  );

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setSearchValue('');
    onSearchChange('');
  };

  const toggleSearch = () => {
    setIsSearch(prev => !prev);
  };


  const handleBarClick = () => {
    if (!isSearch) {
      setIsSearch(true);
    }
  };

  const handleInputClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.searchContainer} style={{ width: barWidth }}>
      <div 
        className={styles.searchBar} 
        onClick={handleBarClick}
      >
        
          <img
            src={!isSearch ? search_icon_grey : search_icon_white}
            onClick={toggleSearch}
            className={`${styles.searchIcon} ${isSearch ? styles.isSearching : ''}`}
            alt="search toggle"
          />

      {isSearch ? (<input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          className={styles.searchInput}
          onChange={handleInputChange}
          onFocus={onFocus}
          onClick={handleInputClick}
          readOnly={!isSearch}
        />) : (
          <div className={styles.notSearchInput} onClick={toggleSearch}>
            {placeholder}
          </div>
        )}
        

        {isSearch && (
          <img
            src={search_clear_icon}
            onClick={handleClear}
            alt="clear"
            className={styles.searchClearIcon}
          />
        )}
      </div>
    </div>
  );
}