import React from 'react';
import styles from './PremiumPaymentInfo.module.css';

export default function PremiumPaymentInfo({ latestPayment }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle} style={{ textAlign: 'left' }}>결제 정보</h2>
      {latestPayment ? (
        <>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>결제 수단</span>
            <span className={styles.infoValue}>{latestPayment.payMethod === 'card' ? '카드' : latestPayment.payMethod}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>카드 번호</span>
            <span className={styles.infoValue}>{latestPayment.cardNumberMasked || '-'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>카드사</span>
            <span className={styles.infoValue}>{latestPayment.cardName || '-'}</span>
          </div>
        </>
      ) : (
        <p className={styles.noInfoText}>결제 정보가 없습니다</p>
      )}
    </div>
  );
}