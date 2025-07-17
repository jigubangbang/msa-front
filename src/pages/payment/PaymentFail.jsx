import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/common/Modal/Modal';

const PaymentFail = () => {
  const [showModal, setShowModal] = useState(true);
  const navigate = useNavigate();

  const handleConfirm = () => {
    setShowModal(false);
    navigate('/payment'); // "다시 결제하기" 버튼 클릭 시 결제 페이지로 이동
  };

  // 이 페이지는 모달을 띄우는 역할만 하므로, 
  // 모달 외부를 클릭하거나 다른 버튼으로 닫는 경우도 결제 페이지로 이동시킵니다.
  const handleClose = () => {
    setShowModal(false);
    navigate('/payment');
  }

  useEffect(() => {
    setShowModal(true);
  }, []);

  return (
    <Modal 
      show={showModal} 
      onClose={handleClose}
      onSubmit={handleConfirm}
      heading="결제 실패"
      firstLabel="다시 결제하기"
    >
      <p>결제 처리 중 오류가 발생했거나 사용자에 의해 취소되었습니다. 다시 시도해주세요.</p>
    </Modal>
  );
};

export default PaymentFail;
