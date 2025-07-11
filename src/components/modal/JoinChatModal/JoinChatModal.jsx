import React, { useState } from 'react';
import styles from './JoinChatModal.module.css';

const JoinChatModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  chatTitle,
  message
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
      onClose();
    } catch (error) {
      console.error('참여 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>정보 공유방 참여</h2>
        
        <div className={styles.chatTitle}>
          {chatTitle}
        </div>
        
        <div className={styles.confirmMessage}>
          <p>이 정보 공유방에 참여하시겠습니까?</p>
          {message && (
            <p className={styles.subMessage}>{message}</p>
          )}
        </div>

        <div className={styles.btnContainer}>
          <button 
            className={`${styles.btn} ${styles.darkButton}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '참여 중...' : '참여하기'}
          </button>
          <button 
            className={`${styles.btn} ${styles.outlineButton}`}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinChatModal;