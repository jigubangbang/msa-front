import React, { useState } from 'react';
import styles from './QuestActionModal.module.css';
import API_ENDPOINTS from '../../../utils/constants';

const QuestActionModal = ({ 
  isOpen, 
  onClose, 
  actionType, // 'challenge', 'retry', 'abandon', 'success'
  questTitle, 
  quest_id, 
  quest_user_id,
  onSuccess,
  // success 모달 전용
  resultMessage: propResultMessage,
  isSuccessResult = false,
  showResultDirectly = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(showResultDirectly);
  const [resultMessage, setResultMessage] = useState(propResultMessage || '');
  const [isSuccess, setIsSuccess] = useState(isSuccessResult);

  if (!isOpen) return null;

  // 액션 타입별 텍스트 매핑
  const getActionText = () => {
    switch(actionType) {
      case 'challenge':
        return '도전';
      case 'retry':
        return '다시 도전';
      case 'abandon':
        return '포기';
      case 'success':
        return '완료';
      default:
        return '';
    }
  };

  // 조사 처리 (을/를)
  const getParticle = (title) => {
    if (!title) return '을';
    const lastChar = title[title.length - 1];
    const code = lastChar.charCodeAt(0);
    // 한글 완성형 체크 (가-힣)
    if (code >= 0xAC00 && code <= 0xD7A3) {
      // 받침이 있으면 '을', 없으면 '를'
      return (code - 0xAC00) % 28 === 0 ? '를' : '을';
    }
    return '을';
  };

  const handleConfirm = async () => {
    if (actionType === 'success') {
      handleResultConfirm();
      return;
    }

    setIsLoading(true);
    
    try {
      let url, method = 'POST';
      
      switch(actionType) {
        case 'challenge':
          url = `${API_ENDPOINTS.QUEST.USER}/challenge/${quest_id}`;
          break;
        case 'retry':
          url = `${API_ENDPOINTS.QUEST.USER}/reChallenge/${quest_id}`;
          break;
        case 'abandon':
          url = `${API_ENDPOINTS.QUEST.USER}/${quest_user_id}/abandon`;
          break;
        default:
          throw new Error('Invalid action type');
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: actionType === 'abandon' ? null : JSON.stringify({ quest_id: quest_id })
      });

      const result = await response.json();
      
      if (result.success) {
        setIsSuccess(true);
        setResultMessage(`${getActionText()}이 완료되었습니다.`);
      } else {
        setIsSuccess(false);
        setResultMessage(result.message || '처리 중 오류가 발생했습니다.');
      }
      
      setShowResult(true);
    } catch (error) {
      console.error('API 요청 실패:', error);
      setIsSuccess(false);
      setResultMessage('네트워크 오류가 발생했습니다.');
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 결과 확인 후 모달 닫기
  const handleResultConfirm = () => {
    setShowResult(false);
    onClose();
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  };

  // 결과 화면
  if (showResult) {
    return (
      <div className={styles.overlay} onClick={handleResultConfirm}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <h2>{isSuccess ? '완료' : '오류'}</h2>
          <div className={styles.formGroup}>
            <p>{resultMessage}</p>
          </div>
          <div className={styles.btnContainer}>
            <button 
              className={`${styles.btn} ${styles.darkButton}`}
              onClick={handleResultConfirm}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 확인 화면
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>퀘스트 {getActionText()}</h2>
        <div className={styles.formGroup}>
          <p>
            <strong>{questTitle}</strong>
            {" 퀘스트"}
            {actionType == 'abandon' ? 
                getParticle(questTitle)
                : "에"} {getActionText()}하시겠습니까?
          </p>
        </div>
        <div className={styles.btnContainer}>
          <button 
            className={`${styles.btn} ${styles.darkButton}`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? '처리중...' : '확인'}
          </button>
          <button 
            className={`${styles.btn} ${styles.outlineButton}`}
            onClick={onClose}
            disabled={isLoading}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestActionModal;