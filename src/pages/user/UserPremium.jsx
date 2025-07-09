import { useEffect, useState } from "react";
import { Circles } from 'react-loader-spinner';
import { useLocation, useNavigate } from 'react-router-dom';
import api from "../../apis/api";
import Sidebar from "../../components/common/SideBar/SideBar";
import PremiumActionButtons from '../../components/user/premium/PremiumActionButtons';
import PremiumPaymentHistory from '../../components/user/premium/PremiumPaymentHistory';
import PremiumPaymentInfo from '../../components/user/premium/PremiumPaymentInfo';
import PremiumSubscriptionStatus from '../../components/user/premium/PremiumSubscriptionStatus';
import API_ENDPOINTS from "../../utils/constants";
import { USER_SIDEBAR } from "../../utils/sidebar";
import styles from "./UserLayout.module.css";

export default function UserPremium() {
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 사이드바
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. 구독 상태를 직접 확인 (Payment.jsx 로직과 동일)
        const subResponse = await api.get('/api/payment/premium/status');
        setSubscriptionStatus(subResponse.data);

        // 2. 구독 정보가 있다면, 결제 내역도 가져오기
        const historyResponse = await api.get('/api/payment/history');
        setPaymentHistory(historyResponse.data);

      } catch (err) {
        if (err.response?.status === 404) {
          // 404는 구독하지 않은 상태로 간주. 오류가 아님.
          setSubscriptionStatus(null);
        } else {
          // 그 외 다른 모든 오류
          console.error("Failed to fetch premium data", err);
          setError("데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Iamport 스크립트 로드
    const jquery = document.createElement("script");
    jquery.src = "https://code.jquery.com/jquery-1.12.4.min.js";
    const iamport = document.createElement("script");
    iamport.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.0.js";
    document.head.appendChild(jquery);
    document.head.appendChild(iamport);
    
    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      document.head.removeChild(jquery);
      document.head.removeChild(iamport);
    };

  }, []); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 한 번만 실행

  const getActiveMenuItems = () => {
    return USER_SIDEBAR.map(item => ({
      ...item,
      active: currentPath === item.path || currentPath.startsWith(item.path + '/')
    }));
  };
  const finalMenuItems = getActiveMenuItems();

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <Circles height="50" width="50" color="#000" ariaLabel="circles-loading" />
        </div>
      );
    }

    if (error) {
      return <p className={styles.errorText}>{error}</p>;
    }

    // 구독 정보가 없는 경우 (API가 404를 반환하여 subscriptionStatus가 null)
    if (!subscriptionStatus) {
      return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <p>프리미엄 구독회원이 아닙니다</p>
          <button onClick={() => navigate('/payment')} className={styles.btnPrimary}>
            결제 페이지로 이동하기
          </button>
        </div>
      );
    }

    // 구독 정보가 있는 경우 (활성/비활성 모두 포함)
    const { premiumHistory, customerUid } = subscriptionStatus;
    const { startDate, endDate, isActive } = premiumHistory;
    const monthlyFee = 990;
    const latestPayment = paymentHistory.length > 0 ? paymentHistory[0] : null;

    return (
      <>
        <PremiumSubscriptionStatus
          isActive={isActive}
          monthlyFee={monthlyFee}
          nextPaymentDate={endDate}
          startDate={startDate}
        />
        <PremiumPaymentInfo latestPayment={latestPayment} />
        <PremiumPaymentHistory paymentHistory={paymentHistory} />
        <PremiumActionButtons 
          subscriptionStatus={subscriptionStatus} 
          paymentHistory={paymentHistory} 
        />
      </>
    );
  };

  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems} />
      <div className={styles.content}>
        <div className={styles.formContainer}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}