import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './FooterTab.module.css';

export default function FooterTab() {
  const location = useLocation();
  
  return (
    <div className={styles.tabContainer}>
      <Link 
        to="/about" 
        className={location.pathname === '/about' ? styles.activeTab : styles.tab}
      >
        사이트 소개
      </Link>
      <Link 
        to="/terms" 
        className={location.pathname === '/terms' ? styles.activeTab : styles.tab}
      >
        이용약관
      </Link>
      <Link 
        to="/privacy" 
        className={location.pathname === '/privacy' ? styles.activeTab : styles.tab}
      >
        개인정보처리방침
      </Link>
      <Link 
        to="/credits" 
        className={location.pathname === '/credits' ? styles.activeTab : styles.tab}
      >
        개발 정보
      </Link>
    </div>
  );
}