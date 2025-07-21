import React from 'react';
import styles from './ConfirmModal.module.css';
const SimpleConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>확인</h2>
        <div className={styles.formGroup}>
          <p>{message}</p>
        </div>
        <div className={styles.btnContainer}>
          <button
            className={`${styles.btn} ${styles.outlineButton}`}
            onClick={onCancel}
          >
            취소
          </button>
          <button
            className={`${styles.btn} ${styles.darkButton}`}
            onClick={onConfirm}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleConfirmModal;