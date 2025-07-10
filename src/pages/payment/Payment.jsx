import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../apis/api';
import '../../styles/payment/Payment.css';
import SubscriptionStatus from './SubscriptionStatus';
import Modal from '../../components/common/Modal/Modal'; // 공통 모달 import
import CirclesSpinner from '../../components/common/Spinner/CirclesSpinner';

const Payment = () => {
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false); // 해지 확인 모달 상태
  const navigate = useNavigate();

  const checkSubscriptionStatus = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/payment/premium/status');
      if (response.data) {
        setSubscription(response.data);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setSubscription(null);
      } else {
        setError('구독 상태를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSubscriptionStatus();

    const jquery = document.createElement("script");
    jquery.src = "https://code.jquery.com/jquery-1.12.4.min.js";
    const iamport = document.createElement("script");
    iamport.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.0.js";
    document.head.appendChild(jquery);
    document.head.appendChild(iamport);
    
    return () => {
      document.head.removeChild(jquery);
      document.head.removeChild(iamport);
    };
  }, []);

  const handlePayment = async () => {
    setError(null);
    try {
      const response = await api.post('/api/payment/premium/subscribe');
      const { merchant_uid, amount, userId } = response.data;

      if (!merchant_uid || amount === undefined || !userId) {
        throw new Error('결제 정보를 받아오지 못했습니다.');
      }

      const { IMP } = window;
      IMP.init('imp44821232'); 

      const paymentData = {
        pg: 'danal_tpay',
        pay_method: 'card',
        merchant_uid,
        name: '지구방방 프리미엄 구독',
        amount,
        customer_uid: userId,
        m_redirect_url: `/payment/success?merchant_uid=${merchant_uid}`,
      };

      IMP.request_pay(paymentData, (rsp) => {
        if (rsp.success) {
          console.log('결제 성공:', rsp);
          navigate(`/payment/success?merchant_uid=${rsp.merchant_uid}`);
        } else {
          console.error('결제 실패:', rsp.error_msg);
          navigate(`/payment/fail?merchant_uid=${rsp.merchant_uid}`);
        }
      });
    } catch (err) {
      console.error('결제 준비 중 오류 발생:', err);
      const errorMessage = err.response?.data?.message || err.message || '알 수 없는 오류가 발생했습니다.';
      setError(`오류가 발생했습니다: ${errorMessage}`);
    }
  };

  // "구독 해지하기" 버튼 클릭 시 모달을 띄우는 함수
  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  // 모달에서 "확인" 버튼을 눌렀을 때 실제 해지를 실행하는 함수
  const confirmCancellation = async () => {
    setShowCancelModal(false); // 먼저 모달을 닫고
    try {
      await api.delete('/api/payment/premium/cancel');
      // 성공 시 별도 알림 없이, 상태 재확인을 통해 화면이 자연스럽게 바뀌도록 유도
      await checkSubscriptionStatus(); 
    } catch (err) {
      const errorMessage = err.response?.data?.message || '구독 해지 중 오류가 발생했습니다.';
      // 실패 시에는 에러 메시지를 표시
      setError(errorMessage); 
    }
  };

  const PremiumBenefit = ({ icon, text }) => (
    <li className="benefitItem">
      <span className="benefitIcon">{icon}</span>
      {text}
    </li>
  );

  if (isLoading) {
    return <CirclesSpinner />;
  }

  if (error) {
    return <div className="payment-container error">{error}</div>;
  }

  if (subscription && subscription.premiumHistory && subscription.premiumHistory.startDate) {
    return (
      <>
        <SubscriptionStatus subscription={subscription} onCancel={handleCancelSubscription} />
        <Modal
          show={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onSubmit={confirmCancellation}
          heading="구독 해지 확인"
          firstLabel="해지하기"
          secondLabel="취소"
        >
          <p>정말로 프리미엄 구독을 해지하시겠습니까? <br /> 남은 기간 동안은 계속 프리미엄 혜택을 이용할 수 있습니다.</p>
        </Modal>
      </>
    );
  }

  return (
    <div className="paymentPageContainer">
      <div className="benefitsContainer">
        <h1>프리미엄 멤버십</h1>
        <p>지금 구독하고 지구방방의 모든 특별한 기능을 자유롭게 이용해보세요. 당신의 여행이 더욱 풍부해집니다.</p>
        <ul className="benefitList">
          <PremiumBenefit icon="✔️" text="광고 없는 무제한 콘텐츠" />
          <PremiumBenefit icon="✔️" text="프리미엄 회원 전용 퀘스트" />
          <PremiumBenefit icon="✔️" text="나만의 커스텀 지도 색상" />
          <PremiumBenefit icon="✔️" text="특별 프로필 뱃지 제공" />
        </ul>
      </div>

      <div className="paymentCard">
        <h2>결제하기</h2>
        <div className="infoRow">
          <span className="infoLabel">상품명</span>
          <span className="infoValue">프리미엄 멤버십 (월간)</span>
        </div>
        <div className="infoRow">
          <span className="infoLabel">정기 결제 금액</span>
          <span className="infoValue">990원</span>
        </div>
        <div className="divider" />
        <div className="totalRow">
          <span className="totalLabel">총 결제 금액</span>
          <span className="totalValue">990원</span>
        </div>
        
        {error && <div className="paymentError">{error}</div>}

        <button onClick={handlePayment} className="paymentButton">
          990원 결제하고 구독하기
        </button>
        <p className="termsText">
          결제 버튼을 클릭함으로써 귀하는 서비스 약관 및 개인정보 보호정책에 동의하게 됩니다. 구독은 언제든지 해지할 수 있습니다.
        </p>
      </div>
 </div>
    
  );
};

export default Payment;