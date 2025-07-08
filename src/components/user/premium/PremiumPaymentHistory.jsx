import React from 'react';
import styles from './PremiumPaymentHistory.module.css';

export default function PremiumPaymentHistory({ paymentHistory }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle} style={{ textAlign: 'left' }}>결제 내역</h2>
      {paymentHistory.length > 0 ? (
        paymentHistory.map((payment) => (
          <div key={payment.id} className={styles.paymentItem}>
            <div>
              <div className={styles.paymentDate}>{new Date(payment.paidAt).toLocaleDateString('ko-KR')}</div>
              {/* 결제 상태에 따라 상품명 변경 */}
              <div>{payment.payStatus === 'CARD_UPDATED' ? '결제 수단 변경' : '프리미엄 월간 구독'}</div>
            </div>
            <div>
              {/* 결제 상태에 따라 금액 변경 */}
              <div className={styles.paymentAmount}>
                {payment.payStatus === 'CARD_UPDATED' ? '0원' : `${payment.amount.toLocaleString()}원`}
              </div>
              <div className={`${styles.paymentStatus} ${styles[payment.payStatus]}`}>
                {payment.payStatus === 'PAID' ? '결제 완료' :
                 payment.payStatus === 'CANCELLED' ? '결제 취소' :
                 payment.payStatus === 'CARD_UPDATED' ? '카드 변경' :
                 '결제 대기'}
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className={styles.noHistoryText}>결제 내역이 없습니다.</p>
      )}
    </div>
  );
}