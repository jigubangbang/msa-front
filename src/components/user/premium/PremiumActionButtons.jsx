import React, { useState } from 'react';
import api from '../../../apis/api';
import Modal from '../../common/Modal/Modal';
import styles from './PremiumActionButtons.module.css';

export default function PremiumActionButtons({ subscriptionStatus, paymentHistory }) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false); // 환불 모달 state
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false); // 결제 수단 변경 모달 state
  const [showResultModal, setShowResultModal] = useState(false); // 결과 알림 모달 state
  const [modalContent, setModalContent] = useState({ heading: '', message: '', success: false }); // 결과 모달 내용
  const [error, setError] = useState(null);

  // --- 구독 해지 관련 핸들러 ---
  const handleCancelSubscription = () => {
    setError(null);
    setShowCancelModal(true);
  };

  const confirmCancellation = async () => {
    setShowCancelModal(false);
    try {
      await api.delete('/api/payment/premium/cancel');
      setModalContent({ heading: '성공', message: '구독이 정상적으로 해지되었습니다.', success: true });
      setShowResultModal(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || '구독 해지 중 오류가 발생했습니다.';
      setModalContent({ heading: '오류', message: errorMessage, success: false });
      setShowResultModal(true);
    }
  };

  // --- 결제 수단 변경 관련 핸들러 ---
  const confirmUpdatePaymentMethod = async () => {
    setShowPaymentMethodModal(false); // 모달을 즉시 닫습니다.
    setError(null);
    const { IMP } = window;
    IMP.init('imp44821232');

    // 1. 백엔드에서 새로운 merchant_uid를 받아오거나, 프론트에서 생성
    const merchant_uid = `mid_${new Date().getTime()}`;
    const customer_uid = subscriptionStatus.customerUid; // 현재 사용자의 빌링키 식별자

    if (!customer_uid) {
      setModalContent({ heading: '오류', message: '결제 정보를 불러올 수 없습니다. 다시 시도해주세요.', success: false });
      setShowResultModal(true);
      return;
    }

    IMP.request_pay({
      pg: 'danal_tpay',
      pay_method: 'card',
      merchant_uid: merchant_uid,
      name: '결제 수단 변경',
      amount: 100, // 카드 인증을 위한 100원 결제
      customer_uid: customer_uid, // 기존 빌링키 식별자
      m_redirect_url: window.location.href // 현재 페이지로 리디렉션
    }, async (rsp) => {
      if (rsp.success) {
        try {
          // 성공 시, 백엔드에 새로운 결제 정보(imp_uid)를 보내 최종 업데이트 요청
          await api.post('/api/payment/premium/change-method', { 
            impUid: rsp.imp_uid
          });
          
          setModalContent({ heading: '성공', message: '결제 수단이 성공적으로 변경되었습니다.', success: true });
          setShowResultModal(true);
        } catch (err) {
          const errorMessage = err.response?.data?.message || '결제 수단 변경에 실패했습니다.';
          setModalContent({ heading: '오류', message: errorMessage, success: false });
          setShowResultModal(true);
        }
      } else {
        setModalContent({ heading: '실패', message: `카드 정보 등록에 실패했습니다: ${rsp.error_msg}`, success: false });
        setShowResultModal(true);
      }
    });
  };

  // --- 환불 요청 관련 핸들러 (신규 추가) ---
  const getLatestPaidPayment = () => {
    return paymentHistory.find(payment => payment.payStatus === 'PAID');
  };

  const handleRefundRequest = () => {
    setError(null);
    const latestPaidPayment = getLatestPaidPayment();
    if (!latestPaidPayment) {
      setModalContent({ heading: '알림', message: '환불 가능한 결제 내역이 없습니다.', success: false });
      setShowResultModal(true);
      return;
    }
    setShowRefundModal(true);
  };

  const confirmRefund = async () => {
    setShowRefundModal(false);
    const latestPaidPayment = getLatestPaidPayment();
    if (!latestPaidPayment) {
      setModalContent({ heading: '알림', message: '환불 가능한 결제 내역이 없습니다.', success: false });
      setShowResultModal(true);
      return;
    }

    try {
      // 1단계에서 정의한 백엔드 API 호출
      await api.post('/api/payment/refund/request', {
        merchantUid: latestPaidPayment.merchantUid
      });
      setModalContent({ heading: '성공', message: '환불 요청이 성공적으로 처리되었습니다.', success: true });
      setShowResultModal(true);

    } catch (err) {
      const errorMessage = err.response?.data?.message || '환불 요청 중 오류가 발생했습니다.';
      setModalContent({ heading: '오류', message: errorMessage, success: false });
      setShowResultModal(true);
    }
  };

  // 결과 모달 닫기 핸들러
  const handleResultModalClose = () => {
    setShowResultModal(false);
    // 성공 케이스였다면 페이지를 새로고침하여 변경사항 반영
    if (modalContent.success) {
      window.location.reload();
    }
  };

  // 날짜가 같은지 확인하는 헬퍼 함수
  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // 구독이 비활성 상태(해지 후 잔여 기간)일 때 안내 메시지 표시
  if (subscriptionStatus && !subscriptionStatus.premiumHistory.isActive) {
    const endDate = new Date(subscriptionStatus.premiumHistory.endDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return (
      <div className={styles.infoText}>
        프리미엄 혜택은 {endDate}까지 유지됩니다
      </div>
    );
  }

  // 구독이 활성 상태일 때만 버튼 표시
  const latestPaidPayment = getLatestPaidPayment();
  const showRefundButton = latestPaidPayment && isSameDay(new Date(latestPaidPayment.paidAt), new Date());

  return (
    <>
      <div className={styles.buttonContainer}>
        <button className={`${styles.btn} ${styles.btnBlack}`} onClick={() => setShowPaymentMethodModal(true)}>결제 수단 변경</button>
        <button className={`${styles.btn} ${styles.btnBlack}`} onClick={handleCancelSubscription}>구독 취소</button>
        {showRefundButton && (
          <button className={`${styles.btn} ${styles.btnBlack}`} onClick={handleRefundRequest}>환불 요청</button>
        )}
      </div>

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

      {/* 환불 요청 확인 모달 (신규 추가) */}
      <Modal
        show={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        onSubmit={confirmRefund}
        heading="환불 요청 확인"
        firstLabel="환불하기"
        secondLabel="취소"
      >
        <p>마지막 결제 건에 대해 환불을 요청하시겠습니까? <br /> 환불이 완료되면 프리미엄 구독은 즉시 해지됩니다.</p>
      </Modal>

      {/* 결제 수단 변경 확인 모달 (신규 추가) */}
      <Modal
        show={showPaymentMethodModal}
        onClose={() => setShowPaymentMethodModal(false)}
        onSubmit={confirmUpdatePaymentMethod}
        heading="결제 수단 변경"
        firstLabel="변경하기"
        secondLabel="취소"
      >
        <p>카드 유효성 검증을 위해 100원이 결제되고 즉시 취소됩니다.</p>
        <p>계속하시겠습니까?</p>
      </Modal>

      {/* 결과 알림 모달 */}
      <Modal
        show={showResultModal}
        onClose={handleResultModalClose}
        onSubmit={handleResultModalClose}
        heading={modalContent.heading}
        firstLabel="확인"
        hideSecondLabel={true}
      >
        <p>{modalContent.message}</p>
      </Modal>
    </>
  );
}