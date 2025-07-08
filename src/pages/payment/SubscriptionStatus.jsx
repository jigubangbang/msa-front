import React from 'react';
import '../../styles/payment/SubscriptionStatus.css';

const SubscriptionStatus = ({ subscription, onCancel }) => {
  if (!subscription) {
    return null;
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  return (
    <div className="status-container">
      <div className="status-card">
        <div className="status-header">
          <span className="premium-badge">Premium</span>
          <h2>{subscription.premiumHistory.isActive ? "프리미엄 구독 중" : "프리미엄 혜택 유지 중"}</h2>
        </div>
        <p className="status-description">
          {subscription.premiumHistory.isActive
            ? "현재 프리미엄 멤버십의 모든 혜택을 이용하고 있습니다."
            : "구독 해지 후에도 남은 기간 동안 프리미엄 혜택이 유지됩니다."}
        </p>
        <div className="status-details">
          <div className="detail-item">
            <span className="detail-label">구독 시작일</span>
            <span className="detail-value">{formatDate(subscription.premiumHistory.startDate)}</span>
          </div>
          {subscription.premiumHistory.endDate && (
            <div className="detail-item">
              <span className="detail-label">{subscription.premiumHistory.isActive ? "다음 결제 예정일" : "혜택 만료일"}</span>
              <span className="detail-value">{formatDate(subscription.premiumHistory.endDate)}</span>
            </div>
          )}
        </div>
        {subscription.premiumHistory.isActive && (
          <button onClick={onCancel} className="cancel-button">
            구독 해지하기
          </button>
        )}
        {!subscription.premiumHistory.isActive && (
          <p className="cancel-info">
            프리미엄 혜택은 {formatDate(subscription.premiumHistory.endDate)}까지 유지됩니다.
          </p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus;
