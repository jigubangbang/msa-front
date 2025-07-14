import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p> 2025 JIGU BANGBANG. All rights reserved.</p>
      <div className={styles.footerLinks}>
        <a href="#">이용약관</a>
        <a href="#">개인정보처리방침</a>
        <a href="#">고객센터</a>
      </div>
    </footer>
  );
}