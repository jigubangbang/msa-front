import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <Link to="/about">사이트 소개</Link>
        <Link to="/terms">이용약관</Link>
        <Link to="/privacy">개인정보처리방침</Link>
        <Link to="/credits">개발 정보</Link>
      </div>
      <p className={styles.copy}>
        © 2025 JIGUBANGBANG. All rights reserved. Made by Team 지구한바퀴. 모든 컨텐츠의 무단 전재, 무단 수집, 재배포 및 AI 학습 이용 금지
      </p>
    </footer>
  );
}