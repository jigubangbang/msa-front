import React from 'react';
import styles from './LoginConfirmModal.module.css';

const LoginConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "로그인 필요",
  message = "로그인이 필요한 서비스입니다."
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className={styles.formGroup}>
          <p>{message}</p>
        </div>
        <div className={styles.btnContainer}>
          <button 
            className={`${styles.btn} ${styles.outlineButton}`}
            onClick={onClose}
          >
            취소
          </button>
          <button 
            className={`${styles.btn} ${styles.darkButton}`}
            onClick={onConfirm}
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginConfirmModal;