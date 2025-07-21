import React from 'react';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  type = 'confirm' // 'confirm' | 'alert'
}) => {
  if (!isOpen) return null;

  console.log("ConfirmModal에서 받은 props - message:", message, "type:", type);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
      onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>{type === 'confirm' ? '확인' : '알림'}</h2>
        <div className={styles.formGroup}>
          <p>{message}</p>
        </div>
        <div className={styles.btnContainer}>
          {type === 'confirm' ? (
            <>
              <button
                className={`${styles.btn} ${styles.cancelButton}`}
                onClick={onClose}
              >
                취소
              </button>
              <button
                className={`${styles.btn} ${styles.darkButton}`}
                onClick={handleConfirm}
              >
                확인
              </button>
            </>
          ) : (
            <button
              className={`${styles.btn} ${styles.darkButton}`}
              onClick={onClose}
            >
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;