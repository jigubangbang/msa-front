import React, { useState, useEffect, useCallback } from 'react';
import styles from './TravelerSearchBar.module.css';
import search_icon_grey from '../../../assets/common/search_grey.svg';
import search_clear_icon from '../../../assets/common/close.svg';

export default function TravelerSearchBar({
  placeholder = "",
  value = "",
  onSearchChange = () => {},
  onFocus = () => {},
  barWidth = "100%",
  debounceMs = 300,
  isSearch,
  setIsSearch
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchValue.trim() !== '') {
      navigate(`/search?query=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBar} style={{ width: barWidth }}>
        <img
          src={isSearch ? search_icon_black : search_icon_grey}
          onClick={toggleSearch}
          className={styles.searchIcon}
          alt="search toggle"
        />

        {isSearch && (
          <>
            <input
              type="text"
              placeholder={placeholder}
              value={searchValue}
              className={styles.searchInput}
              onChange={handleInputChange}
              onFocus={onFocus}
              onKeyDown={handleKeyDown}
            />
            <img
              src={search_clear_icon}
              onClick={handleClear}
              alt="clear"
              className={styles.searchClearIcon}
            />
          </>
        )}
      </div>

      
    </div>
  );
}
