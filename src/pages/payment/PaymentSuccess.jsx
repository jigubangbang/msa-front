import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../styles/payment/PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const searchParams = new URLSearchParams(location.search);
      const merchantUid = searchParams.get('merchant_uid');

      if (!merchantUid) {
        setError('결제 정보를 찾을 수 없습니다.');
        setIsLoading(false);
        return;
      }

      try {
        // 실제 프로덕션에서는 이 merchantUid를 백엔드로 보내 결제가 유효한지 검증해야 합니다.
        // 이 예제에서는 merchant_uid가 존재하면 성공으로 간주합니다.
        console.log('Payment verification successful for merchant_uid:', merchantUid);
        setIsLoading(false);
      } catch (err) {
        console.error('Error during payment verification:', err);
        const errorMessage = err.response?.data?.message || err.message || '결제 검증 중 오류가 발생했��니다.';
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [location]);

  const goToHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return <div className="loading-container">결제 정보를 확인 중입니다...</div>;
  }

  if (error) {
    return (
      <div className="success-container error">
        <div className="success-card">
          <div className="error-icon">!</div>
          <h1>결제 처리 오류</h1>
          <p>{error}</p>
          <button onClick={goToHome} className="confirm-button">홈으로 돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>결제가 완료되었습니다!</h1>
        <p>이제부터 지구방방의 모든 프리미엄 혜택을 누릴 수 있습니다.</p>
        <button onClick={goToHome} className="confirm-button">
          프리미엄 서비스 즐기러 가기
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
