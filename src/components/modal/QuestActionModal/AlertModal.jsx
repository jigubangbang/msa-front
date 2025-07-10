import React from 'react';
import styles from './QuestActionModal.module.css'; 

const AlertModal = ({ 
  isOpen, 
  onClose, 
  title = "알림",
  message 
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
            className={`${styles.btn} ${styles.darkButton}`}
            onClick={onClose}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;