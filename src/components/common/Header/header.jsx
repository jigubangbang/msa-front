// src/components/common/Header/Header.jsx
import React from 'react';
import { UserMenu, SearchBar, NotificationBell } from './components';
import styles from './Header.css';

const Header = ({ user, onSearch, notifications }) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src="/assets/images/logo/logo-main.svg" alt="로고" />
        </div>
        
        <SearchBar onSearch={onSearch} />
        
        <div className={styles.rightSection}>
          <NotificationBell notifications={notifications} />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
};

export default Header;