import React from 'react';
import styles from './PremiumSubscriptionStatus.module.css';

export default function PremiumSubscriptionStatus({ isActive, monthlyFee, nextPaymentDate, startDate }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle} style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '0' }}>현재 구독 상태</h2>
        <div className={`${styles.statusBadge} ${!isActive ? styles.statusBadgeInactive : ''}`}>{isActive ? '활성' : '해지'}</div>
      </div>
      <div className={styles.statusInfo}>
        <div className={styles.statusItem}>
          <div className={styles.label}>월 요금</div>
          <div className={styles.value}>{monthlyFee.toLocaleString()}원</div>
        </div>
        <div className={styles.statusItem}>
          <div className={styles.label}>구독 시작일</div>
          <div className={styles.value}>{startDate ? new Date(startDate).toLocaleDateString('ko-KR') : '-'}</div>
        </div>
        <div className={styles.statusItem}>
          <div className={styles.label}>{isActive ? '다음 결제일' : '구독 만료일'}</div>
          <div className={styles.value}>{nextPaymentDate ? new Date(nextPaymentDate).toLocaleDateString('ko-KR') : '-'}</div>
        </div>
      </div>
    </div>
  );
}