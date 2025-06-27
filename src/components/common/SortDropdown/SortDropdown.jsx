import React, { useState } from 'react';
import styles from './SortDropdown.module.css';

const SortDropdown = ({ value, onChange, sortOptions }) => {
  const [isOpen, setIsOpen] = useState(false);


  const currentOption = sortOptions.find(option => option.value === value) || sortOptions[0];

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={styles.sortDropdown}>
      <button 
        className={styles.dropdownButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentOption.label}
        <img src="/icons/dropdown/dropdown.svg" alt="dropdown icon"/>
        {isOpen && (
          <div className={styles.dropdownMenu}>
            {sortOptions.map((option) => (
              <div
                key={option.value}
                className={`${styles.dropdownItem} ${
                  option.value === value ? styles.active : ''
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </button>
    </div>
  );
};

export default SortDropdown;