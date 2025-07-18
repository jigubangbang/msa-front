import React, { useState } from 'react';
import styles from './JoinApplicationModal.module.css';
import ConfirmModal from '../../common/ErrorModal/ConfirmModal';

const JoinApplicationModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  groupTitle, 
  applicationDescription 
}) => {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('alert');
  const [confirmAction, setConfirmAction] = useState(null);

  
const showAlertModal = (message) => {
    setConfirmMessage(message);
    setConfirmType('alert');
    setConfirmAction(null);
    setShowConfirmModal(true);
  };

  const hideConfirm = () => {
    setShowConfirmModal(false);
    setConfirmMessage('');
    setConfirmAction(null);
  };

  const handleConfirmAction = () => {
    if (confirmAction) {
      confirmAction();
    }
    hideConfirm();
  };



  const handleSubmit = async () => {
    if (!description.trim()) {
      showAlertModal('신청 사유를 입력해주세요.'); 

      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(description);
      setDescription('');
      onClose();
    } catch (error) {
      console.error('신청 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>{groupTitle}</h2>
        
        <div className={styles.applicationInfo}>
          <p>{applicationDescription || '신청 시 실명/나이/연락처 남겨주세요~'}</p>
        </div>

        <div className={styles.formGroup}>
          <textarea
            className={styles.textArea}
            placeholder="참여 신청 사유를 입력해주세요..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
          />
        </div>

        <div className={styles.btnContainer}>
          <button 
            className={`${styles.btn} ${styles.darkButton}`}
            onClick={handleSubmit}
            disabled={isSubmitting || !description.trim()}
          >
            {isSubmitting ? '신청 중...' : '참여 신청'}
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

      
<ConfirmModal
        isOpen={showConfirmModal}
        onClose={hideConfirm}
        onConfirm={confirmAction ? handleConfirmAction : null}
        message={confirmMessage}
        type={confirmType}
      />
    </div>
  );
};

export default JoinApplicationModal;